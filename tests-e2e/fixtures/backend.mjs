// Synthetic, deterministic provider for local QA only. Never imported by the app.
import { createServer } from "node:http";
const port = Number(process.env.FIN_QA_BACKEND_PORT || 8765);
export function response(url) {
  const path = url.pathname.replace(/^\/api\/v1/, "");
  if (path === "/health") return [200, { status: "qa" }];
  if (path.includes("FAIL3")) return [503, { detail: "QA unavailable" }];
  if (path === "/market/assets") {
    const offset = Number(url.searchParams.get("offset") || 0), limit = Number(url.searchParams.get("limit") || 24);
    const search = (url.searchParams.get("search") || "").toUpperCase();
    const rows = Array.from({ length: 10000 }, (_, n) => ({
      ticker: `QA${String(n).padStart(5, "0")}`, name: `Empresa fictícia ${n}`, type: "ACAO", sector: "QA",
      currentPrice: 10 + n / 100, change24h: n % 2 ? -1 : 1, change12m: 2, dividendYield: 3, pvp: 1, pl: 10, sparkline: [],
    })).filter(row => !search || row.ticker.includes(search));
    return [200, rows.slice(offset, offset + limit), { "X-Total-Count": String(rows.length) }];
  }
  if (path === "/market/sectors") return [200, ["TODOS", "QA"]];
  if (path === "/market/highlights") return [200, {}];
  if (path === "/market/benchmarks") return [503, { detail: "Benchmarks unavailable" }];
  if (/\/stocks\/[^/]+\/valuation/.test(path)) return [503, { detail: "QA valuation missing" }];
  const stock = path.match(/^\/stocks\/([^/]+)$/);
  if (stock) return [200, { details: { ticker: stock[1], name: "Empresa de teste SDD", current_price: 12.34, data_cotacao: "2026-10-26", sector: "QA", is_financial_institution: false }, multiples: { ticker: stock[1] }, financials: { ticker: stock[1] } }];
  const history = path.match(/^\/market\/([^/]+)\/history$/);
  if (history) return [200, { ticker: history[1], timeframe: "1M", adjusted: true, total_days: 1, data: [{ date: "2026-10-26", open: 12, high: 13, low: 11, close: 12.34, close_adjusted: 12.34, volume: 100, pct_change: null }] }];
  return [503, { detail: "QA section unavailable" }];
}
const server = createServer((req, res) => {
  const [status, data, headers] = response(new URL(req.url, `http://127.0.0.1:${port}`));
  res.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Expose-Headers": "X-Total-Count", ...headers });
  res.end(JSON.stringify(data));
});
server.listen(port, "127.0.0.1");
