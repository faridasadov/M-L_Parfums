const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

const products = [
  {
    id: 1,
    name: "Burberry Black",
    category: "catalog",
    price: 75.99,
    oldPrice: 99.99,
    currency: "AZN",
    image: "/img/product/1.jpg",
    rating: 4.5
  },
  {
    id: 2,
    name: "Amber Wood",
    category: "catalog",
    price: 68.5,
    oldPrice: 89.99,
    currency: "AZN",
    image: "/img/product/2.jpg",
    rating: 4.5
  },
  {
    id: 3,
    name: "Noir Essence",
    category: "catalog",
    price: 82,
    oldPrice: 110,
    currency: "AZN",
    image: "/img/product/3.jpg",
    rating: 5
  },
  {
    id: 4,
    name: "Velvet Rose",
    category: "catalog",
    price: 59.99,
    oldPrice: 79.99,
    currency: "AZN",
    image: "/img/product/4.jpg",
    rating: 4
  },
  {
    id: 5,
    name: "Citrus Musk",
    category: "catalog",
    price: 64,
    oldPrice: 84,
    currency: "AZN",
    image: "/img/product/5.jpg",
    rating: 4.5
  },
  {
    id: 6,
    name: "Royal Oud",
    category: "catalog",
    price: 95,
    oldPrice: 129,
    currency: "AZN",
    image: "/img/product/6.jpg",
    rating: 5
  },
  {
    id: 7,
    name: "Golden Bloom",
    category: "products",
    price: 72,
    oldPrice: 96,
    currency: "AZN",
    image: "/img/product/7.jpg",
    rating: 4.5
  },
  {
    id: 8,
    name: "Midnight Pour Femme",
    category: "products",
    price: 88,
    oldPrice: 115,
    currency: "AZN",
    image: "/img/product/8.jpg",
    rating: 5
  },
  {
    id: 9,
    name: "Fresh Signature",
    category: "products",
    price: 61,
    oldPrice: 79,
    currency: "AZN",
    image: "/img/product/9.jpg",
    rating: 4.5
  }
];

const reviews = [
  {
    name: "Jhon Dacker",
    image: "/img/male_user.png",
    rating: 4.5,
    text: "Fast delivery and a clean, lasting fragrance. The package arrived in perfect condition."
  },
  {
    name: "Helena Jackson",
    image: "/img/female_user.png",
    rating: 5,
    text: "The scent recommendation was accurate and the perfume stayed fresh through the day."
  },
  {
    name: "Mickel Krew",
    image: "/img/male_user.png",
    rating: 4.5,
    text: "Good prices, original products and quick support from the store team."
  }
];

const blogs = [
  {
    title: "Refreshing and long-lasting perfumes",
    image: "/img/product/10.jpg",
    date: "07 January 2026",
    excerpt: "How to choose a daily fragrance that stays balanced from morning to evening."
  },
  {
    title: "How to store premium fragrances",
    image: "/img/product/9.jpg",
    date: "18 February 2026",
    excerpt: "Simple storage habits that protect perfume notes, color and projection."
  },
  {
    title: "Choosing scents for every season",
    image: "/img/product/8.jpg",
    date: "12 March 2026",
    excerpt: "A practical guide to matching fresh, woody and floral notes with the weather."
  }
];

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

function readMessages() {
  if (!fs.existsSync(MESSAGES_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveMessage(message) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const messages = readMessages();
  messages.push(message);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
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
    return sendJson(res, 200, { ok: true, service: "M&L Parfums API" });
  }

  if (req.method === "GET" && url.pathname === "/api/products") {
    return sendJson(res, 200, products);
  }

  if (req.method === "GET" && url.pathname === "/api/reviews") {
    return sendJson(res, 200, reviews);
  }

  if (req.method === "GET" && url.pathname === "/api/blogs") {
    return sendJson(res, 200, blogs);
  }

  if (req.method === "POST" && url.pathname === "/api/contact") {
    try {
      const rawBody = await readBody(req);
      const parsed = JSON.parse(rawBody || "{}");
      const result = sanitizeMessage(parsed);
      if (result.error) {
        return sendJson(res, 400, { ok: false, error: result.error });
      }
      saveMessage(result.value);
      return sendJson(res, 201, { ok: true, message: "Message received." });
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
