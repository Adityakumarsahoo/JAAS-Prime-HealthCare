 
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Dashboard from "../pages/Dashboard";
import Appointments from "../pages/Appointments";
import AddDoctor from "../pages/AddDoctor";
import DoctorsList from "../pages/DoctorsList";
import Patients from "../pages/Patients";
import Settings from "./pages/Settings";
import PendingApprovals from "./pages/PendingApprovals";
import PendingPatients from "./pages/PendingPatients";
import Activity from "./pages/Activity";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="add-doctor" element={<AddDoctor />} />
        <Route path="doctors-list" element={<DoctorsList />} />
        <Route path="patients" element={<Patients />} />
        <Route path="settings" element={<Settings />} />
        <Route path="pending-approvals" element={<PendingApprovals />} />
        <Route path="pending-patients" element={<PendingPatients />} />
        <Route path="activity" element={<Activity />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
