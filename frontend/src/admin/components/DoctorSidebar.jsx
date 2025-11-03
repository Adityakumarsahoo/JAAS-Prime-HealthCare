 
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, UserCog, CalendarCheck, HelpCircle, LogOut } from "lucide-react";

const DoctorSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const menuItems = [
    { name: "Dashboard", path: "/doctor-dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-2" /> },
    { name: "Appointments", path: "/doctor-dashboard/appointments", icon: <CalendarCheck className="w-5 h-5 mr-2" /> },
    { name: "Profile", path: "/doctor-dashboard/profile", icon: <UserCog className="w-5 h-5 mr-2" /> },
    { name: "Help", path: "/doctor-dashboard/help", icon: <HelpCircle className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r shadow-md p-6 flex flex-col">
      <h2 className="text-2xl font-bold text-indigo-600 mb-8 text-center">DOCTOR</h2>
      <ul className="space-y-4 flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center p-2 rounded-lg transition-all duration-300 ${
              location.pathname === item.path
                ? "bg-indigo-50 text-indigo-700 font-semibold"
                : "hover:bg-indigo-100 text-gray-700"
            }`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </ul>
      <div className="mt-6 pt-4 border-t">
        <button
          type="button"
          className="w-full flex items-center p-2 rounded-lg transition-all duration-300 text-gray-700 hover:bg-red-50 hover:text-red-600"
          onClick={() => {
            try {
              localStorage.removeItem("aToken");
              localStorage.removeItem("role");
              localStorage.removeItem("fullName");
              localStorage.removeItem("email");
            } catch {}
            navigate("/login");
          }}
        >
          <LogOut className="w-5 h-5 mr-2" /> Logout
        </button>
      </div>
    </div>
  );
};

export default DoctorSidebar;


