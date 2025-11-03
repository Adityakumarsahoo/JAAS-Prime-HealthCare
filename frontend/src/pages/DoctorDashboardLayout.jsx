import { Outlet } from 'react-router-dom';
import DoctorSidebar from '../admin/components/DoctorSidebar';

const DoctorDashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <style>{`.hide-doctor-navbar [data-global-navbar]{display:none !important}`}</style>
      <div className="flex">
        <DoctorSidebar />
        <div className="flex-1 p-6 hide-doctor-navbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardLayout;
