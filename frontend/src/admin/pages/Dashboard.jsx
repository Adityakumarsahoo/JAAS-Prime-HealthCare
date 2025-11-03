import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, X, Calendar, Users, Activity, Clock, TrendingUp, AlertCircle, User } from "lucide-react";
import { adminGetAllDoctors, adminGetAllUsers, getAllAppointments, approveAppointment, rejectAppointment } from "../../services/UserService";
// Backend base URL for SSE subscription
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const Dashboard = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctorCount, setDoctorCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: "New doctor added", time: "2 hours ago", user: "Admin" },
    { id: 2, action: "Appointment confirmed", time: "5 hours ago", user: "System" },
    { id: 3, action: "Patient record updated", time: "Yesterday", user: "Dr. Sarah Cole" },
  ]);

  const navigate = useNavigate();

  // Month picker state for filtering appointments on dashboard
  const [selectedMonthLabel, setSelectedMonthLabel] = useState(() => {
    const now = new Date();
    return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
  });
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const handleMonthChange = (e) => {
    const value = e.target.value; // format: YYYY-MM
    if (!value) return;
    const [year, month] = value.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    const label = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    setSelectedMonthLabel(label);
    setMonthPickerOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("aToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleDelete = async (id) => {
    try {
      await rejectAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      setPendingCount((prev) => {
        const next = Math.max(prev - 1, 0);
        try { localStorage.setItem('adminPendingAppointmentCount', String(next)); } catch (_) {}
        return next;
      });
    } catch (e) {
      console.error("Reject failed", e);
      alert("Failed to reject appointment");
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveAppointment(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "Confirmed" } : a));
      setPendingCount((prev) => {
        const next = Math.max(prev - 1, 0);
        try { localStorage.setItem('adminPendingAppointmentCount', String(next)); } catch (_) {}
        return next;
      });
    } catch (e) {
      console.error("Approve failed", e);
      alert("Failed to approve appointment");
    }
  };

  // Approve one pending appointment (first found) and update counts
  const resolveOnePending = async () => {
    try {
      const { data } = await getAllAppointments();
      const list = Array.isArray(data) ? data : [];
      const pendingItem = list.find(a => (a.status || '').toUpperCase() === 'PENDING');
      if (!pendingItem) {
        alert('No pending approvals to resolve.');
        return;
      }
      await approveAppointment(pendingItem.id);
      setPendingCount(prev => {
        const next = Math.max(prev - 1, 0);
        try { localStorage.setItem('adminPendingAppointmentCount', String(next)); } catch (_) {}
        return next;
      });
      setAppointments(prev => prev.map(a => a.id === pendingItem.id ? { ...a, status: 'Confirmed' } : a));
    } catch (e) {
      console.error('Resolve one pending failed', e);
      alert('Failed to resolve a pending approval');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Seed persistent totals from localStorage before fetching
  useEffect(() => {
    try {
      const d = localStorage.getItem('adminDoctorCount');
      if (d !== null) {
        const val = parseInt(d, 10);
        if (!Number.isNaN(val)) setDoctorCount(val);
      }
      const a = localStorage.getItem('adminAppointmentCount');
      if (a !== null) {
        const val = parseInt(a, 10);
        if (!Number.isNaN(val)) setAppointmentCount(val);
      }
      const ap = localStorage.getItem('adminPendingAppointmentCount');
      if (ap !== null) {
        const val = parseInt(ap, 10);
        if (!Number.isNaN(val)) setPendingCount(val);
      }
      const p = localStorage.getItem('adminPatientCount');
      if (p !== null) {
        const val = parseInt(p, 10);
        if (!Number.isNaN(val)) setPatientCount(val);
      }
    } catch (e) {
      console.warn('Admin Dashboard: failed to read persistent totals', e);
    }
  }, []);

  // Load counts and latest appointments from backend
  useEffect(() => {
    (async () => {
      try {
        // Doctors count
        const { data: doctors } = await adminGetAllDoctors();
        const totalDoctors = Array.isArray(doctors) ? doctors.length : 0;
        setDoctorCount(totalDoctors);
        try { localStorage.setItem('adminDoctorCount', String(totalDoctors)); } catch (_) {}
      } catch (e) {
        console.error("Failed to load doctors", e);
        // Keep existing doctor count; do not reset on failure
      }

      try {
        const { data } = await getAllAppointments();
        const list = Array.isArray(data) ? data : [];

        // Normalize appointments for table
        const normalized = list.map((a) => ({
          id: a.id,
          name: a.doctor?.fullName || a.doctorName || "Unknown Doctor",
          specialty: a.doctor?.speciality || a.specialty || "",
          patient: a.patient?.fullName || a.patientName || "Unknown Patient",
          date: a.date || a.appointmentDate || "",
          time: a.time || a.appointmentTime || "",
          status: (a.status || '').toUpperCase() === 'APPROVED' ? 'Confirmed' : ((a.status || '').toUpperCase() === 'PENDING' ? 'Pending' : (a.status || '')),
        }));
        setAppointments(normalized);

        // Appointment count
        setAppointmentCount(list.length);
        try { localStorage.setItem('adminAppointmentCount', String(list.length)); } catch (_) {}

        // Pending approvals count
        const pending = list.filter(a => (a.status || '').toUpperCase() === 'PENDING').length;
        setPendingCount(pending);
        try { localStorage.setItem('adminPendingAppointmentCount', String(pending)); } catch (_) {}

        // Patients count from admin users list (registered patients)
        try {
          const { data: users } = await adminGetAllUsers();
          const totalUsers = Array.isArray(users) ? users.length : 0;
          setPatientCount(totalUsers);
          try { localStorage.setItem('adminPatientCount', String(totalUsers)); } catch (_) {}
        } catch (e) {
          console.warn("Failed to load users for patient count", e);
          // Keep existing patient count; do not change on failure
        }
      } catch (e) {
        console.error("Failed to load appointments", e);
        // Keep existing counts on failures
      }
    })();
  }, []);

  // Subscribe to real-time admin events (SSE) for live updates
  useEffect(() => {
    const token = localStorage.getItem("aToken");
    if (!token) return;

    const url = `${BACKEND_URL}/api/admin/events?token=${encodeURIComponent(token)}`;
    let es;
    try {
      es = new EventSource(url);

      es.addEventListener("message", (evt) => {
        try {
          const payload = JSON.parse(evt.data || "{}");

          // Handle new appointment bookings in real-time
          if (payload?.type === "appointment_booked") {
            const newAppt = {
              id: Date.now(), // temporary client id; actual id will appear on next fetch
              name: payload.doctorName || `Doctor #${payload.doctorId ?? ""}`,
              specialty: payload.specialty || "",
              patient: payload.patientEmail || "Unknown Patient",
              date: payload.date || "",
              time: payload.time || "",
              status: "Pending",
            };

            setAppointments((prev) => [newAppt, ...prev]);
            setAppointmentCount((prev) => {
              const next = prev + 1;
              try { localStorage.setItem('adminAppointmentCount', String(next)); } catch (_) {}
              return next;
            });
            setPendingCount((prev) => {
              const next = prev + 1;
              try { localStorage.setItem('adminPendingAppointmentCount', String(next)); } catch (_) {}
              return next;
            });
          }

          // Patient registration event — update patient count and activity
          if (payload?.type === "patient_registered") {
            setPatientCount((prev) => {
              const next = prev + 1;
              try { localStorage.setItem('adminPatientCount', String(next)); } catch (_) {}
              return next;
            });
            setRecentActivity((prev) => [
              {
                id: Date.now(),
                action: `New patient registered: ${payload.fullName || payload.email || "Unknown"}`,
                time: "Just now",
                user: "System",
              },
              ...prev,
            ]);
          }

          // Appointment status updates (approve/reject) — adjust pending and update list
          if (payload?.type === "appointment_status") {
            const statusRaw = payload.status || "";
            const normalized = statusRaw.toUpperCase() === 'APPROVED' ? 'Confirmed' : (statusRaw.toUpperCase() === 'PENDING' ? 'Pending' : statusRaw);
            setAppointments(prev => prev.map(a => a.id === payload.id ? { ...a, status: normalized } : a));
            if (statusRaw && statusRaw.toUpperCase() !== 'PENDING') {
              setPendingCount(prev => {
                const next = Math.max(prev - 1, 0);
                try { localStorage.setItem('adminPendingAppointmentCount', String(next)); } catch (_) {}
                return next;
              });
            }
          }

          // Appointment cancelled — mark cancelled and reduce pending if applicable
          if (payload?.type === "appointment_cancelled") {
            setAppointments(prev => prev.map(a => a.id === payload.id ? { ...a, status: 'Cancelled' } : a));
            setPendingCount(prev => {
              const next = Math.max(prev - 1, 0);
              try { localStorage.setItem('adminPendingAppointmentCount', String(next)); } catch (_) {}
              return next;
            });
          }

          // Extend here for other event types (approved/rejected/etc.) if emitted
        } catch (e) {
          console.warn("Admin SSE: failed to parse event", e);
        }
      });

      es.onerror = (err) => {
        console.warn("Admin SSE: connection error", err);
      };
    } catch (e) {
      console.warn("Admin SSE: failed to initialize", e);
    }

    return () => {
      try { es?.close(); } catch {}
    };
  }, []);

  // Get current date for greeting
    const getCurrentGreeting = () => {
    const hourIST = Number(
      new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }).format(new Date())
    );
    if (hourIST >= 22 || hourIST < 5) return "Good Night";
    if (hourIST < 12) return "Good Morning";
    if (hourIST < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <p className="text-gray-500 font-medium">{getCurrentGreeting()}, Admin</p>
            <h1 className="text-3xl font-bold text-gray-800">Hospital Dashboard</h1>
          </div>
          <div className="flex gap-4 relative">
            <button
              type="button"
              onClick={() => setMonthPickerOpen((v) => !v)}
              className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2"
              title="Change month"
            >
              <Calendar size={18} />
              <span>{selectedMonthLabel}</span>
            </button>

            {monthPickerOpen && (
              <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                <label className="text-sm text-gray-600 block mb-2">Select month</label>
                <input
                  type="month"
                  onChange={handleMonthChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-all duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Doctors</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{doctorCount}</p>
                <p className="text-green-500 text-xs font-medium mt-2 flex items-center">
                  <TrendingUp size={14} className="mr-1" /> +2 this month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-all duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Appointments</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{appointmentCount}</p>
                <p className="text-green-500 text-xs font-medium mt-2 flex items-center">
                  <TrendingUp size={14} className="mr-1" /> +5 this week
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-all duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Patients</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{patientCount}</p>
                <p className="text-green-500 text-xs font-medium mt-2 flex items-center">
                  <TrendingUp size={14} className="mr-1" /> +12 this month
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <User className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500 hover:shadow-lg transition-all duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Approvals</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{pendingCount}</p>
                <p className="text-amber-500 text-xs font-medium mt-2 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> Requires attention
                </p>
                <button
                  type="button"
                  onClick={resolveOnePending}
                  className="mt-2 text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1 rounded"
                  title="Approve one pending appointment"
                >
                  Resolve one
                </button>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Clock className="text-amber-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Appointments - Takes 2/3 of the space */}
          <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Calendar className="mr-2 text-primary" size={20} />
                Latest Appointments
              </h2>
              <button 
                onClick={() => navigate('/admin/appointments')}
                className="text-primary hover:text-blue-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 rounded-tl-lg">Doctor</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments
                    .filter((a) => {
                      // Filter by selected month label (e.g., "July 2024")
                      try {
                        const [monthName, yearStr] = selectedMonthLabel.split(' ');
                        return a.date.includes(monthName) && a.date.includes(yearStr);
                      } catch {
                        return true;
                      }
                    })
                    .map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                              {a.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="ml-3">
                            <p className="font-medium text-gray-800">{a.name}</p>
                            <p className="text-xs text-gray-500">{a.specialty}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{a.patient}</td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-700">{a.date}</div>
                        <div className="text-xs text-gray-500">{a.time}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          a.status === "Confirmed" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(a.id)}
                            disabled={a.status === "Confirmed"}
                            className={`p-2 rounded-lg ${
                              a.status === "Confirmed"
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-green-100 hover:bg-green-200 text-green-600"
                            }`}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="bg-red-100 hover:bg-red-200 p-2 rounded-lg text-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity - Takes 1/3 of the space */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Activity className="mr-2 text-primary" size={20} />
                Recent Activity
              </h2>
              <button 
                onClick={() => navigate('/admin/activity')}
                className="text-primary hover:text-blue-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Activity size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">{activity.action}</p>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      <span className="mx-1 text-gray-300">�</span>
                      <p className="text-xs text-gray-500">{activity.user}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Animation */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-10 rounded-2xl shadow-xl text-center"
            >
              <h2 className="text-3xl font-bold text-indigo-600">Welcome, Admin ??</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
