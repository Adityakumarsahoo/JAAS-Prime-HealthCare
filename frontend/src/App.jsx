import PatientDashboardLayout from './pages/PatientDashboardLayout'
import DoctorDashboardLayout from './pages/DoctorDashboardLayout'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 🌐 Frontend Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";

// 🧑‍💼 Admin Components
import Sidebar from "./admin/components/Sidebar";
import Topbar from "./admin/components/Topbar";

// 🌐 Frontend Pages
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Appointment from "./pages/Appointment";
import MyAppointments from "./pages/MyAppointments";
import MyProfile from "./pages/MyProfile";
import Verify from "./pages/Verify";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorProfile from "./pages/DoctorProfile";
import DoctorAppointments from "./pages/DoctorAppointments";
import PatientHelp from "./pages/PatientHelp";
import DoctorHelp from "./pages/DoctorHelp";

// 🧑‍💼 Admin Pages
import Dashboard from "./admin/pages/Dashboard";
import DoctorsList from "./admin/pages/DoctorsList";
import AddDoctor from "./admin/pages/AddDoctor";
import EditDoctor from "./admin/pages/EditDoctor";
import AdminAppointments from "./admin/pages/Appointments";
import PendingApprovals from "./admin/pages/PendingApprovals";
import Settings from "./admin/pages/Settings";
import HelpCenter from "./admin/pages/HelpCenter";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isPatientDashboard = location.pathname.startsWith("/patient-dashboard");
  const isDoctorDashboard = location.pathname.startsWith("/doctor-dashboard");
  const isLegacyDoctorProfile = location.pathname.startsWith("/doctor-profile");
  const isLoggedIn = !!localStorage.getItem('aToken');
  const isAdmin = (() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('aToken');
    return role === 'ADMIN' && !!token;
  })();
  const isDoctor = (() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('aToken');
    return role === 'DOCTOR' && !!token;
  })();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:bg-gray-900 dark:text-gray-100">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      {/* 🌐 Show Navbar + Footer only on frontend and not on patient/doctor dashboard or legacy doctor profile */}
      {!isAdminRoute && !isPatientDashboard && !isDoctorDashboard && !isLegacyDoctorProfile && <Navbar />}

      <div className="flex flex-1">
        {/* 🧑‍💼 ADMIN PANEL */}
        {isAdminRoute ? (
          <div className="flex w-full">
            <div className="fixed top-0 left-0 right-0 z-50">
              <Topbar />
            </div>

            <div className="flex w-full pt-16">
              <Sidebar />
              <main className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-800">
                {isAdmin ? (
                  <Routes>
                    <Route path="/admin" element={<Dashboard />} />
                    <Route path="/admin/doctors" element={<DoctorsList />} />
                    <Route path="/admin/add-doctor" element={<AddDoctor />} />
                    <Route path="/admin/edit-doctor/:id" element={<EditDoctor />} />
                    <Route path="/admin/appointments" element={<AdminAppointments />} />
                    <Route path="/admin/pending-approvals" element={<PendingApprovals />} />
                    <Route path="/admin/settings" element={<Settings />} />
                    <Route path="/admin/help" element={<HelpCenter />} />
                  </Routes>
                ) : (
                  <Navigate to="/login" replace />
                )}
              </main>
            </div>
          </div>
        ) : (
          // 🌐 FRONTEND ROUTES
          <div className="flex-1 mx-4 sm:mx-[10%] dark:text-gray-100">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/doctors/:speciality" element={<Doctors />} />
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/appointment/:docId" element={<Appointment />} />
              <Route path="/my-appointments" element={<MyAppointments />} />
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/patient-dashboard" element={<PatientDashboardLayout />}>
  <Route index element={<PatientDashboard />} />
  <Route path="profile" element={<MyProfile />} />
  <Route path="appointments" element={<MyAppointments />} />
  <Route path="doctors" element={<Doctors />} />
  <Route path="help" element={<PatientHelp />} />
</Route>
              <Route path="/doctor-dashboard" element={isDoctor ? <DoctorDashboardLayout /> : <Navigate to="/login" replace />}>
  <Route index element={<DoctorDashboard />} />
  <Route path="profile" element={<DoctorProfile />} />
  <Route path="appointments" element={<DoctorAppointments />} />
  <Route path="help" element={<DoctorHelp />} />
</Route>
              <Route path="/doctor-profile" element={<Navigate to="/doctor-dashboard/profile" replace />} />
            </Routes>
          </div>
        )}
      </div>

      {/* WhatsApp chat button on public pages before login */}
      {!isAdminRoute && !isPatientDashboard && !isDoctorDashboard && !isLegacyDoctorProfile && !isLoggedIn && (
        <WhatsAppFloat />
      )}

      {!isAdminRoute && !isPatientDashboard && !isDoctorDashboard && !isLegacyDoctorProfile && <Footer />}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
