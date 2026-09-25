import { useState } from "react";
import { useLoaderData, Form, useNavigation } from "react-router";
import { 
  UserPlus, 
  Search, 
  Users, 
  UserCheck, 
  CreditCard, 
  X, 
  Mail, 
  Phone, 
  MapPin 
} from "lucide-react";
import { getDb } from "../db";
import { customers } from "../db/schema";
import { seedDatabase } from "../db/seed";
import { desc } from "drizzle-orm";

export async function loader({ context }: { context: any }) {
  const d1 = context?.cloudflare?.env?.DB;

  if (!d1) {
    // Fallback static data if local D1 binding isn't active
    return {
      customersList: [
        { id: "c1", name: "John Doe", email: "john@example.com", phone: "+254 712 345678", address: "Nairobi, Kenya", totalOrders: 12, totalSpent: 145000 },
        { id: "c2", name: "Jane Smith", email: "jane@example.com", phone: "+254 722 987654", address: "Mombasa, Kenya", totalOrders: 5, totalSpent: 48000 },
        { id: "c3", name: "Michael Scott", email: "mscott@dundermifflin.com", phone: "+254 733 112233", address: "Nakuru, Kenya", totalOrders: 2, totalSpent: 24900 },
        { id: "c4", name: "Walk-in Customer", email: "N/A", phone: "N/A", address: "N/A", totalOrders: 45, totalSpent: 310000 },
      ]
    };
  }

  const db = getDb(d1);
  await seedDatabase(db);

  const customersList = await db.select().from(customers).orderBy(desc(customers.createdAt));
  return { customersList };
}

export async function action({ request, context }: { request: Request; context: any }) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  const d1 = context?.cloudflare?.env?.DB;
  if (d1) {
    const db = getDb(d1);
    await db.insert(customers).values({
      id: `c_${Date.now()}`,
      name,
      email: email || "N/A",
      phone: phone || "N/A",
      address: address || "N/A",
      createdAt: new Date().toISOString()
    });
  }

  return { success: true };
}

export default function CustomersRoute() {
  const { customersList } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  const filteredCustomers = customersList.filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCustomers = customersList.length;
  const totalLifetimeValue = customersList.reduce((acc: number, c: any) => acc + (c.totalSpent || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Management</h1>
          <p className="text-sm text-slate-500">Directory of registered clients, purchase histories, and contact info.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
        >
          <UserPlus className="w-4 h-4" /> Add New Customer
        </button>
      </div>

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registered</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalCustomers} customers</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Buyers</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {customersList.filter((c: any) => (c.totalOrders || 0) > 0).length} customers
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Customer Value</p>
            <h3 className="text-2xl font-bold text-slate-900">KSh {totalLifetimeValue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer Name</th>
                <th className="px-6 py-4 font-semibold">Contact Email</th>
                <th className="px-6 py-4 font-semibold">Phone Number</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Orders</th>
                <th className="px-6 py-4 font-semibold">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No customers found matching search term.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{customer.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.phone || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {customer.address || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {customer.totalOrders || 0}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      KSh {(customer.totalSpent || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-lg overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Add New Customer</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <Form method="post" onSubmit={() => setIsModalOpen(false)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Alice Wanjiru"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="alice@example.com"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+254 700 000000"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Address / Location</label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g. Westlands, Nairobi"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
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
                  {isSubmitting ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}