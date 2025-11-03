import { motion } from "framer-motion";

const AdminNavbar = () => {
  return (
    <motion.nav
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-indigo-600 text-white px-8 py-4 shadow-md flex justify-between items-center"
    >
      <h1 className="text-2xl font-bold tracking-widest">JAAS HEALTH</h1>

      <button
        onClick={() => (window.location.href = "/")}
        className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition"
      >
        EXIT
      </button>
    </motion.nav>
  );
};

export default AdminNavbar;
