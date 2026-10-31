import type { CollectionConfig } from "payload";

const publishedOrAuthenticated = ({ req: { user } }: { req: { user?: unknown } }) =>
  user ? true : { _status: { equals: "published" } };

export const Books: CollectionConfig = {
  slug: "books",
  admin: { useAsTitle: "title" },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
    read: publishedOrAuthenticated,
    update: ({ req: { user } }) => Boolean(user),
  },
  versions: { drafts: true },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "subtitle", type: "text" },
    { name: "author", type: "text", required: true },
    { name: "publisher", type: "text" },
    { name: "publicationYear", type: "number" },
    { name: "difficulty", type: "select", options: ["Iniciante", "Intermediário", "Avançado"] },
    { name: "category", type: "text" },
    { name: "review", type: "richText" },
    { name: "keyLessons", type: "array", fields: [{ name: "lesson", type: "text", required: true }] },
  ],
};
