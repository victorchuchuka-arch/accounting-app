import { useState } from "react";
import { useLoaderData, Form, useNavigation } from "react-router";
import { 
  Plus, 
  Search, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  X, 
  CreditCard, 
  Smartphone, 
  Banknote,
  Trash2,
  Receipt
} from "lucide-react";
import { getDb } from "../db";
import { sales, products, customers } from "../db/schema";
import { seedDatabase } from "../db/seed";
import { desc } from "drizzle-orm";

export async function loader({ context }: { context: any }) {
  const d1 = context?.cloudflare?.env?.DB;

  if (!d1) {
    // Fallback static data if local D1 binding isn't active
    return {
      salesList: [
        { id: "s101", customerName: "John Doe", totalAmount: 39900, paymentMethod: "M-Pesa", status: "completed", createdAt: "2026-09-20T14:32:00Z" },
        { id: "s102", customerName: "Jane Smith", totalAmount: 15000, paymentMethod: "Card", status: "completed", createdAt: "2026-09-21T09:15:00Z" },
        { id: "s103", customerName: "Walk-in Customer", totalAmount: 4500, paymentMethod: "Cash", status: "completed", createdAt: "2026-09-21T11:45:00Z" },
        { id: "s104", customerName: "Michael Scott", totalAmount: 24900, paymentMethod: "M-Pesa", status: "pending", createdAt: "2026-09-21T16:00:00Z" },
      ],
      productsList: [
        { id: "p1", name: "Nike Air Max 270", price: 15000, stock: 42 },
        { id: "p2", name: "Apple AirPods Pro", price: 24900, stock: 8 },
        { id: "p3", name: "Leather Minimalist Wallet", price: 4500, stock: 0 },
        { id: "p4", name: "Sony WH-1000XM5", price: 39900, stock: 15 },
        { id: "p5", name: "Unisex Cotton Hoodie", price: 6500, stock: 64 },
      ],
      customersList: [
        { id: "c1", name: "Walk-in Customer" },
        { id: "c2", name: "John Doe" },
        { id: "c3", name: "Jane Smith" },
        { id: "c4", name: "Michael Scott" },
      ]
    };
  }

  const db = getDb(d1);
  await seedDatabase(db);

  const salesList = await db.select().from(sales).orderBy(desc(sales.createdAt));
  const productsList = await db.select().from(products);
  const customersList = await db.select().from(customers);

  return { salesList, productsList, customersList };
}

export async function action({ request, context }: { request: Request; context: any }) {
  const formData = await request.formData();
  const customerName = formData.get("customerName") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const totalAmount = parseFloat(formData.get("totalAmount") as string);
  const status = (formData.get("status") as string) || "completed";

  const d1 = context?.cloudflare?.env?.DB;
  if (d1) {
    const db = getDb(d1);
    await db.insert(sales).values({
      id: `s_${Date.now()}`,
      customerName: customerName || "Walk-in Customer",
      totalAmount,
      paymentMethod,
      status,
      createdAt: new Date().toISOString()
    });
  }

  return { success: true };
}

export default function SalesRoute() {
  const { salesList, productsList, customersList } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigation = useNavigation();

  // POS Modal Cart State
  const [selectedCustomer, setSelectedCustomer] = useState("Walk-in Customer");
  const [paymentMethod, setPaymentMethod] = useState("M-Pesa");
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);

  const isSubmitting = navigation.state === "submitting";

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as any
    );
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.16; // 16% VAT
  const grandTotal = subtotal + tax;

  const filteredSales = salesList.filter((s: any) =>
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = salesList
    .filter((s: any) => s.status === "completed")
    .reduce((acc: number, s: any) => acc + s.totalAmount, 0);

  const completedCount = salesList.filter((s: any) => s.status === "completed").length;
  const pendingCount = salesList.filter((s: any) => s.status === "pending").length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales & POS Checkout</h1>
          <p className="text-sm text-slate-500">Record sales, issue receipts, and manage customer orders.</p>
        </div>
        <button
          onClick={() => {
            setCart([]);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> New Sale / POS
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales Revenue</p>
            <h3 className="text-2xl font-bold text-slate-900">KSh {totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Orders</p>
            <h3 className="text-2xl font-bold text-slate-900">{completedCount} orders</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Orders</p>
            <h3 className="text-2xl font-bold text-slate-900">{pendingCount} orders</h3>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search sales by ID, customer, or payment method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Sales Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Payment Method</th>
                <th className="px-6 py-4 font-semibold">Total Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No sales orders recorded yet.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale: any) => (
                  <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">
                      #{sale.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {sale.customerName}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                        {sale.paymentMethod === "M-Pesa" && <Smartphone className="w-3.5 h-3.5 text-emerald-600" />}
                        {sale.paymentMethod === "Card" && <CreditCard className="w-3.5 h-3.5 text-blue-600" />}
                        {sale.paymentMethod === "Cash" && <Banknote className="w-3.5 h-3.5 text-amber-600" />}
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      KSh {sale.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {sale.status === "completed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                      {sale.status === "pending" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">Point of Sale (POS)</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Left Product List, Right Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 overflow-y-auto p-6 gap-6">
              {/* Product Selection List */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">Available Products</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {productsList.map((product: any) => (
                    <div
                      key={product.id}
                      className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200/60 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">KSh {product.price.toLocaleString()} • Stock: {product.stock}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Cart & Payment */}
              <Form method="post" onSubmit={() => setIsModalOpen(false)} className="flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Customer</label>
                    <select
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800"
                    >
                      {customersList.map((c: any) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-slate-600 mb-2">Cart Items</h3>
                    {cart.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No items added to checkout cart yet.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="font-semibold text-slate-800 shrink-0 max-w-[120px] truncate">{item.name}</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 font-bold flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="font-bold text-slate-900">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 font-bold flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-mono font-bold text-slate-900">
                              KSh {(item.price * item.quantity).toLocaleString()}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["M-Pesa", "Card", "Cash"].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                            paymentMethod === method
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subtotal, Tax, and Hidden Fields */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Subtotal:</span>
                    <span>KSh {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>VAT (16%):</span>
                    <span>KSh {tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                    <span>Grand Total:</span>
                    <span className="text-blue-600 font-mono">KSh {grandTotal.toLocaleString()}</span>
                  </div>

                  <input type="hidden" name="customerName" value={selectedCustomer} />
                  <input type="hidden" name="paymentMethod" value={paymentMethod} />
                  <input type="hidden" name="totalAmount" value={grandTotal} />

                  <button
                    type="submit"
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full mt-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
                  >
                    {isSubmitting ? "Processing..." : `Complete Sale (KSh ${grandTotal.toLocaleString()})`}
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}