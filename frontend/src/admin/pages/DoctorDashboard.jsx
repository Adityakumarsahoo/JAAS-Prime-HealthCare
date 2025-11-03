 
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Users,
  DollarSign,
  UserCog,
  Stethoscope,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { backendUrl, aToken } = useContext(AppContext);
  const [state, setState] = useState({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('DoctorDashboard: Fetching profile with token:', aToken);
        
        const res = await axios.get(`${backendUrl}/api/doctors/profile`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        
        console.log('DoctorDashboard: Profile response:', res.data);
        
        if (res.data && typeof res.data === 'object') {
          console.log('Doctor data received:', res.data);
          const doctorName = res.data.fullName;
          console.log('Doctor name:', doctorName);
          
          setState(prev => {
            const newState = {
              ...prev,
              name: doctorName || '',
              email: res.data.email || ''
            };
            console.log('Setting state to:', newState);
            return newState;
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error("Error fetching doctor profile:", err);
        if (err.response) {
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);
        }
        setError("Failed to load doctor profile");
      } finally {
        setLoading(false);
      }
    };

    if (aToken) {
      fetchDoctorProfile();
    } else {
      console.log('DoctorDashboard: No auth token available');
    }
  }, [aToken, backendUrl]);

  const stats = [
    {
      title: "Total Appointments",
      value: "42",
      icon: <CalendarCheck className="w-10 h-10 text-indigo-600" />,
    },
    {
      title: "Total Patients",
      value: "28",
      icon: <Users className="w-10 h-10 text-green-600" />,
    },
    {
      title: "Total Earnings",
      value: "$1,240",
      icon: <DollarSign className="w-10 h-10 text-yellow-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-10 px-6">
      <motion.div
        className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-3">
            <Stethoscope className="w-10 h-10 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-indigo-700">Doctor Dashboard</h1>
              <p className="text-sm text-gray-600">
                {loading ? "Loading..." : 
                 error ? error :
                 (() => {
                   const cleaned = (state.name || '').replace(/^(dr\.?\s*)+/i, '').trim();
                   return state.name ? `Welcome back, Dr. ${cleaned}` : "Welcome back";
                 })()}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/doctor-profile")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 shadow-md"
          >
            <UserCog className="w-5 h-5" />
            <span>Update Profile</span>
          </motion.button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="p-6 bg-white border rounded-xl shadow-md hover:shadow-lg hover:border-indigo-300 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-50 rounded-full">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-2xl font-bold text-indigo-700">
                    {item.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl p-6 text-center shadow-inner"
        >
          <p className="text-lg text-gray-700 font-medium">
            “Your dedication is the heartbeat of healthcare.”
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DoctorDashboard;

