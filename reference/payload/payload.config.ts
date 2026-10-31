import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import { Articles } from "./src/collections/Articles";
import { Books } from "./src/collections/Books";
import { Glossary } from "./src/collections/Glossary";
import { Users } from "./src/collections/Users";

const payloadSecret = process.env.PAYLOAD_SECRET;
const adminEmails = (process.env.PAYLOAD_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
if (!payloadSecret && process.env.NODE_ENV === "production") {
  throw new Error("PAYLOAD_SECRET is required in Preview and Production deployments.");
}
if (adminEmails.length === 0 && process.env.NODE_ENV === "production") {
  throw new Error("PAYLOAD_ADMIN_EMAILS must list the approved CMS administrator emails.");
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  secret: payloadSecret || "local-development-secret-change-before-deploy-0001",
  admin: {
    user: Users.slug,
    importMap: { baseDir: process.cwd() },
    meta: { titleSuffix: " — FIN CMS" },
  },
  collections: [Users, Articles, Books, Glossary],
  editor: lexicalEditor(),
  graphQL: { disable: true },
  db: postgresAdapter({
    pool: { connectionString: process.env.PAYLOAD_DATABASE_URL || "" },
    schemaName: "fin_payload",
    push: process.env.NODE_ENV !== "production",
  }),
  typescript: { outputFile: "src/payload-types.ts" },
});
