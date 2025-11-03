import { Outlet } from 'react-router-dom';
import PatientSidebar from '../components/PatientSidebar';

const PatientDashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <style>{`.hide-patient-navbar [data-global-navbar]{display:none !important}`}</style>
      <div className="flex">
        <PatientSidebar />
        <div className="flex-1 p-6 hide-patient-navbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardLayout;