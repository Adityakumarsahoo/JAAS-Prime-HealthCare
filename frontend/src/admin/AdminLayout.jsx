import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">
        <div className="p-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
