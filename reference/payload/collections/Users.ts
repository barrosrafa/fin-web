import type { CollectionConfig } from "payload";

const adminEmails = new Set(
  (process.env.PAYLOAD_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: { useAsTitle: "email" },
  access: {
    admin: ({ req: { user } }) => !user || Boolean(user.email && adminEmails.has(user.email.toLowerCase())),
    create: ({ req: { user } }) => Boolean(user?.email && adminEmails.has(user.email.toLowerCase())),
    delete: ({ req: { user } }) => Boolean(user?.email && adminEmails.has(user.email.toLowerCase())),
    read: ({ req: { user } }) => Boolean(user?.email && adminEmails.has(user.email.toLowerCase())),
    update: ({ req: { user } }) => Boolean(user?.email && adminEmails.has(user.email.toLowerCase())),
  },
  fields: [],
};
