# M&L Parfums

Portable storefront for M&L Parfums with a Node.js backend, MariaDB database and static frontend.

## Run

```bash
npm start
```

Open:

```text
http://localhost:3000
```

Optional port:

```bash
PORT=8080 npm start
```

## Database

Create and seed the MariaDB database:

```bash
npm run db:import
```

Default connection values:

```text
DB_NAME=ml_parfums
DB_USER=root
DB_SOCKET=/var/lib/mysql/mysql.sock
```

You can override them with environment variables. See `.env.example`.

## API

- `GET /api/health`
- `GET /api/products`
- `GET /api/reviews`
- `GET /api/blogs`
- `POST /api/contact`

Products, reviews, blogs and contact messages are stored in MariaDB.

## Database Export

The latest dump is included at:

```text
db/export.sql
```

Import it on another machine:

```bash
mysql -uroot < db/export.sql
```

Create a fresh export after changes:

```bash
npm run db:export
```

## Move To Another Server

Copy the project folder or the generated archive, extract it, then run:

```bash
npm start
```

Install dependencies, import the database and run the server:

```bash
npm install
npm run db:import
npm start
```

Node.js 18 or newer and MariaDB are required.
