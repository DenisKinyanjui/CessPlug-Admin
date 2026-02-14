import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Tag,
  Zap,
  ShoppingCart,
  Users,
  Image,
  Settings,
  Menu,
  X,
  User,
  Wallet,
  PiggyBank, // New icon for Chama
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { to: "/admin/banners", icon: Image, label: "Banners" },
    { to: "/admin/flash-deals", icon: Zap, label: "Flash Deals" },
    { to: "/admin/products", icon: Package, label: "Products" },
    { to: "/admin/categories", icon: FolderOpen, label: "Categories" },
    { to: "/admin/brands", icon: Tag, label: "Brands" },
    { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/chamas", icon: PiggyBank, label: "Chama Groups" },
    { to: "/admin/payouts", icon: Wallet, label: "Payouts" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-gray-900 text-white focus:outline-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white min-h-screen transition-transform duration-300 ease-in-out`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold ml-8 sm:ml-0">CessPlug Admin</h1>
          </div>
          <div className="flex flex-row gap-2 text-gray-200 mt-2">
            <User className="h-auto" />
            <span className="text-sm font-medium text-gray-400">
              {user?.name}
            </span>
          </div>
        </div>

        <nav className="mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white border-r-4 border-blue-400"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;