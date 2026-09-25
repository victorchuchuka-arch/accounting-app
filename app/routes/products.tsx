import { useState } from "react";
import { useLoaderData, Form, useNavigation } from "react-router";
import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Filter,
  X
} from "lucide-react";
import { getDb } from "../db";
import { products } from "../db/schema";
import { seedDatabase } from "../db/seed";
import { desc } from "drizzle-orm";

export async function loader({ context }: { context: any }) {
  const d1 = context?.cloudflare?.env?.DB;

  if (!d1) {
    // Fallback data if local binding isn't active
    return {
      productsList: [
        { id: "p1", name: "Nike Air Max 270", sku: "SKU-9021", category: "Footwear", price: 15000, cost: 9000, stock: 42, status: "in_stock" },
        { id: "p2", name: "Apple AirPods Pro", sku: "SKU-4410", category: "Electronics", price: 24900, cost: 18000, stock: 8, status: "low_stock" },
        { id: "p3", name: "Leather Minimalist Wallet", sku: "SKU-1120", category: "Accessories", price: 4500, cost: 1500, stock: 0, status: "out_of_stock" },
        { id: "p4", name: "Sony WH-1000XM5", sku: "SKU-8821", category: "Electronics", price: 39900, cost: 28000, stock: 15, status: "in_stock" },
        { id: "p5", name: "Unisex Cotton Hoodie", sku: "SKU-3301", category: "Apparel", price: 6500, cost: 2500, stock: 64, status: "in_stock" },
      ]
    };
  }

  const db = getDb(d1);
  await seedDatabase(db);

  const productsList = await db.select().from(products).orderBy(desc(products.createdAt));
  return { productsList };
}

export async function action({ request, context }: { request: Request; context: any }) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const category = formData.get("category") as string;
  const price = parseFloat(formData.get("price") as string);
  const cost = parseFloat(formData.get("cost") as string);
  const stock = parseInt(formData.get("stock") as string, 10);

  let status: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
  if (stock === 0) status = "out_of_stock";
  else if (stock <= 10) status = "low_stock";

  const d1 = context?.cloudflare?.env?.DB;
  if (d1) {
    const db = getDb(d1);
    await db.insert(products).values({
      id: `p_${Date.now()}`,
      name,
      sku,
      category,
      price,
      cost,
      stock,
      status,
      createdAt: new Date().toISOString()
    });
  }

  return { success: true };
}

export default function Products() {
  const { productsList } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  const filteredProducts = productsList.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...Array.from(new Set(productsList.map((p: any) => p.category)))];

  const totalStock = productsList.reduce((acc: number, p: any) => acc + p.stock, 0);
  const lowStockCount = productsList.filter((p: any) => p.status === "low_stock").length;
  const outOfStockCount = productsList.filter((p: any) => p.status === "out_of_stock").length;

  return (
    <div className="space-y-8">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products & Inventory</h1>
          <p className="text-sm text-slate-500">Track items, adjust stock levels, and manage pricing.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Items Stocked</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalStock.toLocaleString()} units</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Warnings</p>
            <h3 className="text-2xl font-bold text-slate-900">{lowStockCount} items</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Out of Stock</p>
            <h3 className="text-2xl font-bold text-slate-900">{outOfStockCount} items</h3>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-medium text-slate-500 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat as string}
              onClick={() => setSelectedCategory(cat as string)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                selectedCategory === cat 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat as string}
            </button>
          ))}
        </div>
      </div>

      {/* Product Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Product Name</th>
                <th className="px-6 py-4 font-semibold">SKU</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Selling Price</th>
                <th className="px-6 py-4 font-semibold">Stock Quantity</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{p.name}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{p.sku}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      KSh {p.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {p.stock} units
                    </td>
                    <td className="px-6 py-4">
                      {p.status === "in_stock" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" /> In Stock
                        </span>
                      )}
                      {p.status === "low_stock" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                        </span>
                      )}
                      {p.status === "out_of_stock" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> Out of Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-lg overflow-hidden space-y-6 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Add New Inventory Item</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <Form method="post" onSubmit={() => setIsModalOpen(false)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Wireless Bluetooth Speaker"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    required
                    placeholder="e.g. SKU-5020"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    required
                    placeholder="e.g. Electronics"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Price (KSh)</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    required
                    placeholder="1200"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cost (KSh)</label>
                  <input
                    type="number"
                    name="cost"
                    step="0.01"
                    required
                    placeholder="800"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    placeholder="25"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                >
                  {isSubmitting ? "Saving..." : "Save Product"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}