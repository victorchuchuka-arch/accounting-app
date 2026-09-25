import { NavLink } from "react-router";
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  BarChart3,
  Package,
  Truck,
  Users,
  ShieldCheck,
  Settings,
  HelpCircle,
  Zap,
} from "lucide-react";

const mainNav = [
  { name: "Dashboard", to: "/", icon: LayoutDashboard },
  { name: "Sales & Orders", to: "/sales", icon: ShoppingBag },
  { name: "Inventory", to: "/inventory", icon: Boxes },
  { name: "Report & Analytics", to: "/reports", icon: BarChart3 },
];

const managementNav = [
  { name: "Products", to: "/products", icon: Package },
  { name: "Supplies", to: "/supplies", icon: Truck },
  { name: "Customers", to: "/customers", icon: Users },
  { name: "User & Roles", to: "/roles", icon: ShieldCheck },
];

const settingsNav = [
  { name: "Settings", to: "/settings", icon: Settings },
  { name: "Help & Support", to: "/support", icon: HelpCircle },
];

export function Sidebar() {
  const getLinkClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white font-semibold shadow-sm"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
          S
        </div>
        <span className="font-bold text-lg text-slate-800 tracking-tight">
          shilingi<span className="text-blue-600">_yangu</span>
        </span>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6">
        <div>
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          <div className="space-y-1">
            {mainNav.map((item) => (
              <NavLink key={item.to} to={item.to} className={getLinkClass}>
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Management
          </p>
          <div className="space-y-1">
            {managementNav.map((item) => (
              <NavLink key={item.to} to={item.to} className={getLinkClass}>
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Settings
          </p>
          <div className="space-y-1">
            {settingsNav.map((item) => (
              <NavLink key={item.to} to={item.to} className={getLinkClass}>
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Pro Upgrade Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
            Upgrade Pro!
          </div>
          <p className="text-xs text-blue-100 leading-relaxed">
            Unlock advanced analytics & multi-outlet sync.
          </p>
          <button className="w-full bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold py-2 rounded-xl transition-colors">
            Upgrade Now →
          </button>
        </div>
      </div>
    </aside>
  );
}