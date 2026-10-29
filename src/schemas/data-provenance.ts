import { z } from "zod";

export const SnapshotMetaSchema = z.object({
  schema: z.string().min(1),
  schema_version: z.literal("1.0.0"),
  generated_at: z.iso.datetime({ offset: true }),
  content_hash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  source: z.string().min(1),
});
export type DataMode = "loading" | "missing" | "stale" | "demo" | "estimated" | "periodic";
export interface DataProvenance {
  mode: DataMode;
  source?: string;
  asOf?: string;
  collectedAt?: string;
}
