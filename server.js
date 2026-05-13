const http = require("node:http");
const fs = require("node:fs");
const mariadb = require("mariadb");
const path = require("node:path");
const { URL } = require("node:url");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DB_NAME = process.env.DB_NAME || "ml_parfums";
const DB_SOCKET = process.env.DB_SOCKET || "/var/lib/mysql/mysql.sock";

const pool = mariadb.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: DB_NAME,
  socketPath: process.env.DB_SOCKET === "" ? undefined : DB_SOCKET,
  connectionLimit: 5,
  decimalAsNumber: true,
  insertIdAsNumber: true
});

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".otf": "font/otf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sanitizeMessage(input) {
  const name = String(input.name || "").trim();
  const email = String(input.email || "").trim();
  const phone = String(input.phone || "").trim();
  const message = String(input.message || "").trim();

  if (!name || !email || !phone) {
    return { error: "Name, email and phone are required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email format is invalid." };
  }

  return {
    value: {
      id: Date.now(),
      name: name.slice(0, 120),
      email: email.slice(0, 160),
      phone: phone.slice(0, 60),
      message: message.slice(0, 1000),
      createdAt: new Date().toISOString()
    }
  };
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    oldPrice: row.old_price,
    currency: row.currency,
    image: row.image,
    rating: row.rating
  };
}

function mapReview(row) {
  return {
    id: row.id,
    name: row.name,
    image: row.image,
    rating: row.rating,
    text: row.text
  };
}

function mapBlog(row) {
  return {
    id: row.id,
    title: row.title,
    image: row.image,
    date: formatDate(row.published_on),
    excerpt: row.excerpt
  };
}

async function dbQuery(sql, params = []) {
  let connection;
  try {
    connection = await pool.getConnection();
    return await connection.query(sql, params);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

function safeFilePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const requested = decoded === "/" ? "/index.html" : decoded;
  const normalized = path.normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, normalized);
  if (!filePath.startsWith(ROOT)) {
    return null;
  }
  return filePath;
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    try {
      await dbQuery("SELECT 1");
      return sendJson(res, 200, {
        ok: true,
        service: "M&L Parfums API",
        database: DB_NAME
      });
    } catch (error) {
      return sendJson(res, 500, { ok: false, error: error.message });
    }
  }

  if (req.method === "GET" && url.pathname === "/api/products") {
    const rows = await dbQuery("SELECT * FROM products ORDER BY id");
    return sendJson(res, 200, rows.map(mapProduct));
  }

  if (req.method === "GET" && url.pathname === "/api/reviews") {
    const rows = await dbQuery("SELECT * FROM reviews ORDER BY id");
    return sendJson(res, 200, rows.map(mapReview));
  }

  if (req.method === "GET" && url.pathname === "/api/blogs") {
    const rows = await dbQuery("SELECT * FROM blogs ORDER BY published_on DESC, id DESC");
    return sendJson(res, 200, rows.map(mapBlog));
  }

  if (req.method === "POST" && url.pathname === "/api/contact") {
    try {
      const rawBody = await readBody(req);
      const parsed = JSON.parse(rawBody || "{}");
      const result = sanitizeMessage(parsed);
      if (result.error) {
        return sendJson(res, 400, { ok: false, error: result.error });
      }
      const saved = await dbQuery(
        "INSERT INTO messages (name, email, phone, message) VALUES (?, ?, ?, ?)",
        [result.value.name, result.value.email, result.value.phone, result.value.message]
      );
      return sendJson(res, 201, {
        ok: true,
        id: saved.insertId,
        message: "Message received."
      });
    } catch (error) {
      return sendJson(res, 400, { ok: false, error: error.message });
    }
  }

  return sendJson(res, 404, { ok: false, error: "API endpoint not found." });
}

function serveStatic(req, res, url) {
  const filePath = safeFilePath(url.pathname);
  if (!filePath) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      return res.end("Not found");
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "content-type": contentTypes[ext] || "application/octet-stream",
      "content-length": stat.size
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname.startsWith("/api/")) {
    await handleApi(req, res, url);
    return;
  }

  serveStatic(req, res, url);
});

server.listen(PORT, () => {
  console.log(`M&L Parfums is running at http://localhost:${PORT}`);
});
