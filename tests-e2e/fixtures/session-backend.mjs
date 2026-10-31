// Isolated fake identity provider. No database or external service is accessed.
import { createServer } from "node:http";
const user = { id: "session-qa", email: "qa@example.test", name: "QA", role: "user", tier: "free", is_active: true };
createServer((req, res) => {
  res.setHeader("content-type", "application/json");
  const path = new URL(req.url, "http://localhost").pathname;
  if (path === "/health") return res.end('{}');
  if (path === "/api/v1/auth/login") return res.end(JSON.stringify({ token: "qa-session-secret", token_type: "Bearer", expires_in: 3600, user }));
  if (path === "/api/v1/auth/me" && req.headers.authorization === "Bearer qa-session-secret") return res.end(JSON.stringify(user));
  if (path === "/api/v1/auth/logout") return res.end('{"logged_out":true}');
  res.statusCode = 401;
  res.end('{"detail":"unauthorized"}');
}).listen(18982, "127.0.0.1");
