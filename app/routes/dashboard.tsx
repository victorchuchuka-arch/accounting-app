import { useLoaderData } from "react-router";
import { 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight, 
  MoreVertical 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { getDb } from "../db";
import { products, orders } from "../db/schema";
import { seedDatabase } from "../db/seed";
import { desc, sum, count } from "drizzle-orm";

export async function loader({ context }: { context: any }) {
  // Access Cloudflare D1 binding
  const d1 = context?.cloudflare?.env?.DB;
  
  if (!d1) {
    // Local fallback/mock mode if binding is not passed in dev standalone mode
    return {
      totalRevenue: 888000,
      totalOrdersCount: 1240,
      totalStockCount: 3450,
      recentOrdersList: [
        { id: "ORD-1004", customerName: "John Doe", totalAmount: 24900, paymentMethod: "M-Pesa", status: "completed", createdAt: "2026-09-21" },
        { id: "ORD-1003", customerName: "Amina Hussein", totalAmount: 4500, paymentMethod: "Cash", status: "pending", createdAt: "2026-09-21" },
        { id: "ORD-1002", customerName: "David Ochieng", totalAmount: 19500, paymentMethod: "Card", status: "completed", createdAt: "2026-09-21" },
        { id: "ORD-1001", customerName: "Sarah Jenkins", totalAmount: 39900, paymentMethod: "M-Pesa", status: "completed", createdAt: "2026-09-20" },
      ]
    };
  }

  const db = getDb(d1);
  await seedDatabase(db);

  const [allProducts, allOrders, recentOrdersList] = await Promise.all([
    db.select().from(products),
    db.select().from(orders),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5)
  ]);

  const totalRevenue = allOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalStockCount = allProducts.reduce((acc, p) => acc + p.stock, 0);

  return {
    totalRevenue,
    totalOrdersCount: allOrders.length,
    totalStockCount,
    recentOrdersList
  };
}

const chartData = [
  { month: "Jan", revenue: 450000 },
  { month: "Feb", revenue: 520000 },
  { month: "Mar", revenue: 610000 },
  { month: "Apr", revenue: 580000 },
  { month: "May", revenue: 720000 },
  { month: "Jun", revenue: 888000 },
];

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();

  const metrics = [
    { title: "Total Revenue", value: `KSh ${data.totalRevenue.toLocaleString()}`, change: "+12.5%", icon: DollarSign, isPositive: true },
    { title: "Total Orders", value: data.totalOrdersCount.toLocaleString(), change: "+8.2%", icon: ShoppingBag, isPositive: true },
    { title: "Items Stocked", value: data.totalStockCount.toLocaleString(), change: "-2.1%", icon: Package, isPositive: false },
    { title: "Net Profit Margin", value: "24.8%", change: "+4.1%", icon: TrendingUp, isPositive: true },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{m.title}</span>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{m.value}</h3>
                <p className={`text-xs mt-1 font-semibold ${m.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {m.change} <span className="text-slate-400 font-normal">vs last month</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts & Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Analytics Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Revenue Performance</h2>
              <p className="text-slate-400 text-xs mt-0.5">Monthly revenue trends for 2026</p>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  tickFormatter={(val) => `KSh ${val / 1000}k`}
                  width={65}
                />
                <Tooltip cursor={{ fill: "#F8FAFC" }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Recent Orders List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {data.recentOrdersList.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{order.customerName}</p>
                  <p className="text-xs text-slate-400">{order.id} • {order.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">KSh {order.totalAmount.toLocaleString()}</p>
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full mt-0.5 ${
                    order.status === "completed" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}