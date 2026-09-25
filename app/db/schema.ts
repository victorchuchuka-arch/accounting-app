import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  category: text("category").notNull(),
  price: real("price").notNull(),
  cost: real("cost").notNull(),
  stock: integer("stock").notNull().default(0),
  status: text("status", { enum: ["in_stock", "low_stock", "out_of_stock"] }).notNull().default("in_stock"),
  createdAt: text("created_at").notNull(),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  totalAmount: real("total_amount").notNull(),
  status: text("status", { enum: ["completed", "pending", "cancelled"] }).notNull().default("completed"),
  paymentMethod: text("payment_method").notNull(),
  createdAt: text("created_at").notNull(),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").references(() => orders.id),
  productId: text("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
});
// Sales table
export const sales = sqliteTable("sales", {
  id: text("id").primaryKey(),
  customerName: text("customerName").notNull(),
  totalAmount: real("totalAmount").notNull(),
  paymentMethod: text("paymentMethod").notNull(),
  status: text("status").notNull(),
  createdAt: text("createdAt").notNull(),
});

// Customers table
export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  createdAt: text("createdAt"),
});