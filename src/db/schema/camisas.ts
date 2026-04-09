import {
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const camisas = pgTable("camisas", {
  id: uuid("id").defaultRandom().primaryKey(),
  club: varchar("club", { length: 120 }).notNull(),
  brand: varchar("brand", { length: 80 }).notNull(),
  model: varchar("model", { length: 120 }).notNull(),
  year: integer("year").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  imageUrl: varchar("image_url", { length: 2048 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
