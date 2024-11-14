import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import config from "./../utils/config";

// Define the UserRole enum
export enum UserRole {
  User = "User",
  Admin = "Admin",
}

// Create a connection pool
const pool = new Pool({
  connectionString: config.databaseUrl,
});

// Initialize Drizzle ORM with the pool
export const db = drizzle(pool);

// Define the documents table schema with UUID
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileExtension: varchar("fileExtension", { length: 10 }).notNull(),
  filepath: text("filepath").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// Define the users table schema with UUID and role
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 10 }).notNull().default(UserRole.User),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Define the tags table schema
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// Define the permissions table schema
export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  permissionType: varchar("permissionType", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// Define the documentTag table schema to create a many-to-many relationship between documents and tags
export const documentTags = pgTable(
  "document_tags",
  {
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (t) => ({
    pk: primaryKey(t.documentId, t.tagId),
  })
);

//Defining the Relationships of the documents
export const documentsRelations = relations(
  documents,
  ({ many }: { many: any }) => ({
    tags: many(documentTags),
  })
);

// Relationships for tags
export const tagsRelations = relations(tags, ({ many }: { many: any }) => ({
  documents: many(documentTags),
}));

// Relationships for documentTags
export const documentTagsRelations = relations(
  documentTags,
  ({ one }: { one: any }) => ({
    document: one(documents, {
      fields: [documentTags.documentId],
      references: [documents.id],
    }),
    tag: one(tags, {
      fields: [documentTags.tagId],
      references: [tags.id],
    }),
  })
);

// Relationships for users
export const usersRelations = relations(users, ({ many }: { many: any }) => ({
  permissions: many(permissions),
}));

// Relationships for permissions (if needed for further extension)
export const permissionsRelations = relations(
  permissions,
  ({ one }: { one: any }) => ({
    user: one(users, {
      fields: [permissions.id],
      references: [users.id],
    }),
  })
);
