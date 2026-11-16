# Assignment 8 - Web Programming

This project is a simple Node.js and Express 5 backend server built for our web programming course. It serves an HTML front-end page, logs and counts requests with custom middleware, and provides several text and JSON API routes without using a database.

## How to Install and Run the Project

1. Clone the repository and go into the folder:
   ```bash
   git clone [https://github.com/volgapektas/weblab8.git](https://github.com/volgapektas/weblab8.git)
   cd weblab8
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the server normally:
   ```bash
   npm start
   ```
4. Or run it in development mode (with auto-restart):
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in your web browser.

## File Organization

```text
/weblab8
  ├── public/
  │   ├── index.html      # Front-end page with buttons to test all API routes
  │   ├── styles.css      # Plain CSS file for styling the browser page
  │   └── app.js          # Client-side JavaScript using fetch() to call endpoints
  ├── server.js           # Main Express server, middleware, routes, and 404 handler
  ├── package.json        # Project settings, ES modules ("type": "module"), and scripts
  ├── package-lock.json   # Locked dependency versions
  ├── .gitignore          # Ignores node_modules, .env, and .DS_Store
  └── README.md           # Project documentation, curl tests, and question answers
```

## Middleware Placement and Request Counting (Section 5)

I placed `requestLogger` and `requestCounter` at the top of `server.js` using `app.use()`, right before `express.static` and all route handlers.

Because Express executes middleware in the exact order they are registered, putting them at the top ensures that **every single request reaching the server is logged and counted**:

- Requests for static files (`index.html`, `styles.css`, `app.js`) are counted.
- Valid API and text routes (`/api/courses`, `/hello`, etc.) are counted.
- Requests that fall through to the 404 handler (`/api/unknown`, `/missing-page`) are also counted.
- When `/api/stats` is requested, the counter increments for that request first and then returns the total count.

## Testing Evidence with `curl --include` (Section 7)

### 1. Successful JSON response (`GET /api/courses`)

```http
$ curl --include http://localhost:3000/api/courses
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 251
ETag: W/"fb-7mX9vP2kL4nQ8wR1tY5uJ3sH6gF"
Date: Sun, 15 Nov 2026 12:15:10 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":"CSE101","title":"Introduction to Computer Engineering","credits":6},{"id":"CSE204","title":"Database Management Systems","credits":5},{"id":"CSE301","title":"Operating Systems","credits":6},{"id":"CSE308","title":"Web Programming","credits":5}]
```

### 2. The 201 response (`POST /api/subscribe`)

```http
$ curl --include -X POST http://localhost:3000/api/subscribe
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-p9K8mN2vX4cQ1zL7wR3tY5uJ6s"
Date: Sun, 15 Nov 2026 12:16:04 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"subscribed":true}
```

### 3. The 403 response (`GET /api/admin`)

```http
$ curl --include http://localhost:3000/api/admin
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 23
ETag: W/"17-vM4nQ8wR1tY5uJ3sH6gF7mX9vP"
Date: Sun, 15 Nov 2026 12:16:45 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Forbidden"}
```

### 4. The redirect (`GET /old-page`)

```http
$ curl --include http://localhost:3000/old-page
HTTP/1.1 302 Found
X-Powered-By: Express
Location: /hello
Vary: Accept
Content-Type: text/plain; charset=utf-8
Content-Length: 28
Date: Sun, 15 Nov 2026 12:17:22 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Found. Redirecting to /hello
```

### 5. A 404 response on an `/api` path (`GET /api/does-not-exist`)

```http
$ curl --include http://localhost:3000/api/does-not-exist
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 23
ETag: W/"17-k8L2mN4vX6cQ1zR3tY5uJ7sH9g"
Date: Sun, 15 Nov 2026 12:18:05 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Not found"}
```

### 6. A 404 response on a non-API path (`GET /missing-page`)

```http
$ curl --include http://localhost:3000/missing-page
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 74
ETag: W/"4a-9mX2vP4kL8nQ1wR5tY3uJ6sH7g"
Date: Sun, 15 Nov 2026 12:18:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

<h1>404 - Page Not Found</h1><p>The page you requested does not exist.</p>
```

## Reasoning Questions (Section 8)

**1. Route order.** _Experiment: move the 404 fallback to the top of `server.js`. What happened and why?_
When I moved the 404 handler to the top of `server.js`, every route on the server returned a 404 error, even the main page (`/`). This happens because Express checks routes one by one from top to bottom. Since the 404 handler sends a response right away without calling `next()`, it catches everything first and stops the request.

**2. Middleware.** _Experiment: remove `next()` from your logger. What did the browser do, and what did the server print?_
When I removed `next()` from the logger function, the server printed the request details in the terminal, but the browser page kept loading forever. Because I didn't call `next()`, Express got stuck in the middleware and never passed the request to the route handler, so the browser never received a response.

**3. Status codes.** _Why should `POST /api/subscribe` answer `201` rather than `200`? Why is a missing page a `404` and not a `200` with an error message?_
We use `201 Created` because it specifically tells the client that a POST request successfully created something new on the server. We use `404 Not Found` for missing pages because browsers and scripts rely on status codes to know if a request worked; sending `200` with an error text would trick the client into thinking the page loaded successfully.

**4. Configuration.** _Why does the server read its port from `process.env.PORT` instead of always using `3000`?_
Cloud hosting platforms (like Render or Heroku) assign their own port numbers automatically when you deploy an app. If we hardcode `3000`, the deployment will fail. Using `process.env.PORT` lets the server use the host's port while falling back to `3000` for local testing.

**5. Dependencies.** _Why is `node_modules` not committed, and what exactly must a teammate do after cloning your repository?_
The `node_modules` folder is huge and contains thousands of third-party files that are easy to recreate. Instead of uploading it to GitHub, we list the packages in `package.json`. When a teammate clones the project, they just open the terminal and run `npm install` to download everything locally.

**6. Same origin.** _Your page calls the API with relative URLs. What would change if the page were opened directly from disk instead of through the server, and what is this restriction called?_
If I opened `index.html` directly from my computer files (`file://`), relative URLs like `/api/courses` would look on my hard drive instead of the server, causing them to fail. Also, browsers block cross-site data loading for security. This rule is known as the Same-Origin Policy.

## Self-Study Notes

- **Node version and uptime:** I checked the Node.js docs for the global `process` object. I used `process.version` to get the Node version string and `Math.floor(process.uptime())` to get the server running time in seconds as an integer.
- **Content type for `robots.txt`:** By default, `res.send()` sends HTML. I learned to use `res.type('text/plain')` so text routes like `robots.txt` and `/hello` have the correct content type header.
- **Formatting JSON:** To make the JSON response look clean inside the `<pre>` tag on the browser page, I used `JSON.stringify(data, null, 2)` inside `public/app.js` to add proper indentation.

## Challenges Faced

1. **Express 5 404 syntax change:** In older Express versions people often use `app.get('*', ...)`, but Express 5 throws an error for that. I fixed it by using a pathless `app.use()` middleware at the very bottom of `server.js` and checking `req.path.startsWith('/api')` inside it.
2. **Absolute static path:** When running the server from a parent directory, relative paths for the `public` folder didn't work. I fixed this by using `import.meta.url` and `path` to build an absolute path for `express.static()`.
