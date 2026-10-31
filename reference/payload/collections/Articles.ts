import type { CollectionConfig } from "payload";

const publishedOrAuthenticated = ({ req: { user } }: { req: { user?: unknown } }) =>
  user ? true : { _status: { equals: "published" } };

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: { useAsTitle: "title", defaultColumns: ["title", "category", "_status", "publishedAt"] },
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
    { name: "excerpt", type: "textarea", required: true },
    { name: "body", type: "richText", required: true },
    { name: "authorName", type: "text", required: true },
    {
      name: "category",
      type: "select",
      required: true,
      options: ["Ações", "FIIs", "ETFs", "Renda fixa", "Educação financeira"],
    },
    { name: "tags", type: "array", fields: [{ name: "tag", type: "text", required: true }] },
    { name: "readingTimeMinutes", type: "number", min: 1, defaultValue: 5 },
    { name: "isPremium", type: "checkbox", defaultValue: false },
    { name: "publishedAt", type: "date" },
  ],
};
