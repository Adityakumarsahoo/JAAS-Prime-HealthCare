import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, CalendarCheck, User, Search, HelpCircle } from "lucide-react";

const PatientSidebar = () => {
  const location = useLocation();
  const menuItems = [
    { name: "Dashboard", path: "/patient-dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-2" /> },
    { name: "Appointments", path: "/patient-dashboard/appointments", icon: <CalendarCheck className="w-5 h-5 mr-2" /> },
    { name: "Find Doctors", path: "/patient-dashboard/doctors", icon: <Search className="w-5 h-5 mr-2" /> },
    { name: "My Profile", path: "/patient-dashboard/profile", icon: <User className="w-5 h-5 mr-2" /> },
    { name: "Help", path: "/patient-dashboard/help", icon: <HelpCircle className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r shadow-md p-6">
      <h2 className="text-2xl font-bold text-indigo-600 mb-8 text-center">PATIENT</h2>
      <ul className="space-y-4">
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
    </div>
  );
};

export default PatientSidebar;