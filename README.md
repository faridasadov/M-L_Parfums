# M&L Parfums

Portable storefront for M&L Parfums with a Node.js backend and static frontend.

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

## API

- `GET /api/health`
- `GET /api/products`
- `GET /api/reviews`
- `GET /api/blogs`
- `POST /api/contact`

Contact messages are stored locally in `data/messages.json`.

## Move To Another Server

Copy the project folder or the generated archive, extract it, then run:

```bash
npm start
```

The project has no external backend dependencies. Node.js 18 or newer is enough.
