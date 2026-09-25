import { Search, Bell, Plus, ChevronDown, Calendar, Filter } from "lucide-react";

export function Header() {
  return (
    <header className="h-20 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10">
      {/* Global Search Bar */}
      <div className="relative w-96">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search SKU, orders, products..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Action Controls & Profile */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 border border-slate-200 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Filter className="w-4 h-4" /> Filter
        </button>

        <button className="flex items-center gap-2 border border-slate-200 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Calendar className="w-4 h-4" /> Jun - 2026
        </button>

        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all">
          <Plus className="w-4 h-4" /> New Order
        </button>

        <div className="h-6 w-[1px] bg-slate-200 mx-1" />

        <button className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-blue-600 rounded-full absolute top-2 right-2" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Victor Smith"
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
          <div className="text-left hidden sm:block">
            <h4 className="text-sm font-bold text-slate-800 leading-none">Victor Smith</h4>
            <span className="text-xs text-slate-400 mt-1 block">Store Manager</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
}