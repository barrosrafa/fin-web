import type { DataProvenance } from "@/schemas/data-provenance";

export function quoteProvenance(source?: string, asOf?: string, now?: number): DataProvenance {
  const timestamp = asOf ? Date.parse(asOf) : Number.NaN;
  if (!source || !Number.isFinite(timestamp) || (now !== undefined && timestamp > now)) return { mode: "missing", source, asOf };
  return { mode: now !== undefined && now - timestamp > 4 * 86_400_000 ? "stale" : "periodic", source, asOf };
}
