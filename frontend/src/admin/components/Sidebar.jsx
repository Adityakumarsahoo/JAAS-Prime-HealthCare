import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  UserPlus,
  Users,
  Settings,
  LogOut,
  Activity,
  HelpCircle
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Appointments",
      path: "/admin/appointments",
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      name: "Add Doctor",
      path: "/admin/add-doctor",
      icon: <UserPlus className="w-5 h-5" />,
    },
    {
      name: "Doctor List",
      path: "/admin/doctors",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: "Patients",
      path: "/admin/patients",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: "Pending Approvals",
      path: "/admin/pending-approvals",
      icon: <Activity className="w-5 h-5" />,
      
    },
    {
      name: "Pending Patients",
      path: "/admin/pending-patients",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      name: "Help Center",
      path: "/admin/help",
      icon: <HelpCircle className="w-5 h-5" />,
    },
  ];

  return (
    <div className="w-64 h-screen bg-white shadow-md border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-primary">
          JAAS <span className="text-sm font-normal text-gray-500">Admin</span>
        </h2>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-6 px-4 overflow-y-auto">
        <div className="mb-4 px-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Main Menu</p>
        </div>
        <ul className="space-y-1.5">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-primary text-white font-medium shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className={`${location.pathname === item.path ? "text-white" : "text-gray-500"}`}>
                  {item.icon}
                </span>
                <span className="ml-3">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 mb-4 px-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Support</p>
        </div>
        <ul className="space-y-1.5">
          <li>
            <button
              className="w-full flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-all duration-200"
              onClick={() => {
                localStorage.removeItem("aToken");
                localStorage.removeItem("role");
                window.location.href = "/login";
              }}
            >
              <LogOut className="w-5 h-5 text-gray-500" />
              <span className="ml-3">Logout</span>
            </button>
          </li>
        </ul>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
            A
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">Admin User</p>
            <p className="text-xs text-gray-500">admin@jaas.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

