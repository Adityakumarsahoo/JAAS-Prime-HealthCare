 
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const DoctorNavbar = () => {
  const location = useLocation();
  const menus = [
    { name: "Dashboard", path: "/doctor/dashboard" },
    { name: "Appointments", path: "/doctor/appointments" },
    { name: "Profile", path: "/doctor/profile" },
  ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white shadow-md fixed top-0 left-0 w-full z-50"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">JAAS HEALTH</h1>

        <div className="flex gap-6 text-gray-700">
          {menus.map((menu) => (
            <Link
              key={menu.path}
              to={menu.path}
              className={`text-sm font-medium transition ${
                location.pathname === menu.path
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                  : "hover:text-indigo-500"
              }`}
            >
              {menu.name}
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default DoctorNavbar;
