import config from "@payload-config";
import { getPayload } from "payload";

const email = process.env.PAYLOAD_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.PAYLOAD_ADMIN_PASSWORD;
const approvedEmails = new Set(
  (process.env.PAYLOAD_ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

if (!email || !password || !approvedEmails.has(email)) {
  throw new Error("Set PAYLOAD_ADMIN_EMAIL and PAYLOAD_ADMIN_PASSWORD; the email must be in PAYLOAD_ADMIN_EMAILS.");
}

const payload = await getPayload({ config });
try {
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });
  if (existing.totalDocs > 0) {
    throw new Error("A CMS user with this email already exists; no account was changed.");
  }

  await payload.create({
    collection: "users",
    data: { email, password },
    overrideAccess: true,
  });
  console.log("CMS administrator created.");
} finally {
  await payload.destroy();
}
