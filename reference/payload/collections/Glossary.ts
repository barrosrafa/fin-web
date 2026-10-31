import type { CollectionConfig } from "payload";

const publishedOrAuthenticated = ({ req: { user } }: { req: { user?: unknown } }) =>
  user ? true : { _status: { equals: "published" } };

export const Glossary: CollectionConfig = {
  slug: "glossary",
  admin: { useAsTitle: "term", defaultColumns: ["term", "category", "slug"] },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
    read: publishedOrAuthenticated,
    update: ({ req: { user } }) => Boolean(user),
  },
  versions: { drafts: true },
  fields: [
    { name: "term", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "category", type: "text", required: true },
    { name: "shortDefinition", type: "textarea", required: true },
    { name: "definition", type: "richText", required: true },
    { name: "formula", type: "text" },
  ],
};
