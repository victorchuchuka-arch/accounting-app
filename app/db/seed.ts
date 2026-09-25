import { products, orders } from "./schema";
import type { getDb } from "./index";

export const SEED_PRODUCTS = [
  { id: "p1", name: "Nike Air Max 270", sku: "SKU-9021", category: "Footwear", price: 15000, cost: 9000, stock: 42, status: "in_stock" as const, createdAt: new Date().toISOString() },
  { id: "p2", name: "Apple AirPods Pro", sku: "SKU-4410", category: "Electronics", price: 24900, cost: 18000, stock: 8, status: "low_stock" as const, createdAt: new Date().toISOString() },
  { id: "p3", name: "Leather Minimalist Wallet", sku: "SKU-1120", category: "Accessories", price: 4500, cost: 1500, stock: 0, status: "out_of_stock" as const, createdAt: new Date().toISOString() },
  { id: "p4", name: "Sony WH-1000XM5", sku: "SKU-8821", category: "Electronics", price: 39900, cost: 28000, stock: 15, status: "in_stock" as const, createdAt: new Date().toISOString() },
  { id: "p5", name: "Unisex Cotton Hoodie", sku: "SKU-3301", category: "Apparel", price: 6500, cost: 2500, stock: 64, status: "in_stock" as const, createdAt: new Date().toISOString() },
];

export const SEED_ORDERS = [
  { id: "ORD-1004", customerName: "John Doe", totalAmount: 24900, status: "completed" as const, paymentMethod: "M-Pesa", createdAt: "2026-09-21T14:20:00Z" },
  { id: "ORD-1003", customerName: "Amina Hussein", totalAmount: 4500, status: "pending" as const, paymentMethod: "Cash", createdAt: "2026-09-21T11:45:00Z" },
  { id: "ORD-1002", customerName: "David Ochieng", totalAmount: 19500, status: "completed" as const, paymentMethod: "Card", createdAt: "2026-09-21T08:30:00Z" },
  { id: "ORD-1001", customerName: "Sarah Jenkins", totalAmount: 39900, status: "completed" as const, paymentMethod: "M-Pesa", createdAt: "2026-09-20T10:15:00Z" },
];

export async function seedDatabase(db: ReturnType<typeof getDb>) {
  const existingProducts = await db.select().from(products);
  if (existingProducts.length === 0) {
    await db.insert(products).values(SEED_PRODUCTS);
  }

  const existingOrders = await db.select().from(orders);
  if (existingOrders.length === 0) {
    await db.insert(orders).values(SEED_ORDERS);
  }
}