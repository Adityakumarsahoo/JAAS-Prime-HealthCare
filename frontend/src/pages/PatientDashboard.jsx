import { useState, useEffect, useContext } from "react";
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Bell, ChevronRight } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { getMyAppointments, cancelAppointment } from '../services/UserService.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import PatientDashboardNavbar from '../components/PatientDashboardNavbar';
import PatientDashboardFooter from '../components/PatientDashboardFooter';
import PaymentOptions from '../components/PaymentOptions';
import notificationService from '../services/NotificationService.jsx';
import { processPayment, showPaymentProcessing, handlePaymentSuccess, handlePaymentFailure } from '../services/PaymentService';

const PatientDashboard = () => {
  const location = useLocation();
  const [patientData, setPatientData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const appCtx = useContext(AppContext);
  const backendUrl = appCtx?.backendUrl;
  const aToken = appCtx?.aToken;
  const currencySymbol = (appCtx?.currencySymbol) || '₹';

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const storedTokenRaw = localStorage.getItem('aToken');
        const storedToken = storedTokenRaw ? storedTokenRaw.trim() : "";
        console.log('[PatientDashboard] aToken (context):', aToken);
        console.log('[PatientDashboard] storedToken (localStorage):', storedToken);
        if (!storedToken) {
          toast.error('Please log in again');
          return;
        }

        const response = await axios.get(`${backendUrl}/api/patients/profile`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        
        if (response.data) {
          console.log('Patient data:', response.data);
          setPatientData(response.data);
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          toast.error('Session expired. Please log in again');
        } else {
          toast.error('Failed to load patient data');
        }
      }
    };

    if (aToken) {
      fetchPatientData();
    }
  }, [aToken, backendUrl]);

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const res = await getMyAppointments();
        const list = Array.isArray(res.data) ? res.data : [];
        setAppointments(list);
      } catch (err) {
        console.error('Failed to load patient appointments', err);
      }
    };
    if (aToken) loadAppointments();
  }, [aToken]);

  // Notifications using notification service
  const [notifications, setNotifications] = useState([]);

  // Load notifications for current patient
  useEffect(() => {
    if (patientData?.email) {
      const patientNotifications = notificationService.getNotificationsForPatient(patientData.email);
      setNotifications(patientNotifications);

      // Subscribe to notification changes
      const unsubscribe = notificationService.subscribe(() => {
        const updatedNotifications = notificationService.getNotificationsForPatient(patientData.email);
        setNotifications(updatedNotifications);
      });

      return unsubscribe;
    }
  }, [patientData?.email]);

  // Subscribe to real-time patient events (SSE)
  useEffect(() => {
    if (!aToken || !backendUrl || !patientData?.email) return;

    const url = `${backendUrl}/api/patient/events?token=${encodeURIComponent(aToken)}`;
    let es;
    try {
      es = new EventSource(url);
      es.addEventListener('message', (evt) => {
        try {
          const payload = JSON.parse(evt.data || '{}');

          // Only handle events targeting this patient
          const targetEmail = payload?.patientEmail;
          if (targetEmail && targetEmail !== patientData.email) return;

          if (payload?.type === 'appointment_status') {
            const status = (payload.status || '').toUpperCase();
            setAppointments(prev => prev.map(a => a.id === payload.id ? { ...a, status } : a));

            const message = `Your appointment on ${payload.date || ''} at ${payload.time || ''} is ${status}.`;
            const notifType = status === 'APPROVED' ? 'success' : (status === 'REJECTED' ? 'warning' : 'info');
            notificationService.addNotification(patientData.email, message, notifType);
          }

          if (payload?.type === 'appointment_cancelled') {
            setAppointments(prev => prev.map(a => a.id === payload.id ? { ...a, status: 'CANCELLED' } : a));
            const message = `Your appointment on ${payload.date || ''} at ${payload.time || ''} has been cancelled.`;
            notificationService.addNotification(patientData.email, message, 'info');
          }
        } catch (e) {
          console.warn('Patient SSE: failed to parse event', e);
        }
      });

      es.onerror = (err) => {
        console.warn('Patient SSE: connection error', err);
      };
    } catch (e) {
      console.warn('Patient SSE: failed to initialize', e);
    }

    return () => {
      try { es?.close(); } catch {}
    };
  }, [aToken, backendUrl, patientData?.email]);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Activate tab based on URL hash (e.g., #notifications)
  useEffect(() => {
    const hash = (location.hash || '').replace('#', '').trim();
    const validTabs = ['overview', 'appointments', 'notifications'];
    if (validTabs.includes(hash)) {
      setActiveTab(hash);
    }
  }, [location]);

  // Handle payment option click
  const handlePaymentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPaymentModal(true);
  };

  // Handle payment method selection
  const handlePaymentSelect = async (appointment, paymentMethod) => {
  console.log('Payment method selected:', paymentMethod, 'for appointment:', appointment.id);
  setShowPaymentModal(false);
  try {
    showPaymentProcessing(paymentMethod);
    const result = await processPayment(selectedAppointment, paymentMethod);
    handlePaymentSuccess(result);

    if (["cash", "upi", "netbanking"].includes(paymentMethod)) {
      setAppointments(prev => prev.map(a => ((a.id === appointment.id) ? { ...a, status: "APPROVED" } : a)));
    }
  } catch (error) {
    handlePaymentFailure(error);
  }
};

  return (
    <>
      <PatientDashboardNavbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Patient Dashboard</h1>
            <p className="text-gray-600">Welcome back, {patientData ? patientData.fullName : 'Loading...'}</p>
          </div>
        </div>

      {/* Quick Stats (trimmed to remove dummy health/meds) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Upcoming Appointments</p>
              <h3 className="text-2xl font-bold text-gray-800">{appointments.filter(a => a.status !== 'CANCELLED').length}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </div>
          <Link to="/patient-dashboard/appointments" className="text-primary text-sm font-medium flex items-center mt-4 hover:underline">
            View Schedule <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Notifications</p>
              <h3 className="text-2xl font-bold text-gray-800">{notifications.filter(n => !n.read).length}</h3>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Bell className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <Link to="#notifications" className="text-amber-500 text-sm font-medium flex items-center mt-4 hover:underline" onClick={() => setActiveTab('notifications')}>
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-8">
        <div className="flex border-b">
          <button 
            className={`px-6 py-4 text-sm font-medium ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`px-6 py-4 text-sm font-medium ${activeTab === 'appointments' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments
          </button>
          {/* Removed Medications and Health tabs (dummy data) */}
          <button 
            className={`px-6 py-4 text-sm font-medium ${activeTab === 'notifications' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Health Summary</h2>
              
              {/* Upcoming Appointment */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-700">Next Appointment</h3>
                  <Link to="/patient-dashboard/appointments" className="text-primary text-sm hover:underline">View All</Link>
                </div>
                {appointments.length > 0 ? (
                  <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-full mr-4">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{appointments[0].doctor?.fullName || appointments[0].doctor?.name || 'Doctor'}</h4>
                        <p className="text-sm text-gray-600">{appointments[0].doctor?.speciality || ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">{appointments[0].date}</p>
                      <p className="text-sm text-gray-600">{appointments[0].time}</p>
                    </div>
                    {appointments[0].status === 'PENDING' ? (
                      <button
                        onClick={() => handlePaymentClick(appointments[0])}
                        className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors cursor-pointer"
                      >
                        Pending for payment
                      </button>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (appointments[0].status === 'CONFIRMED' || appointments[0].status === 'APPROVED') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {appointments[0].status}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No upcoming appointments</p>
                )}
              </div>

              {/* Removed Health Metrics and Recent Medications sections (dummy content) */}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Your Appointments</h2>
                <Link to="/appointment" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Book New Appointment
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{appointment.doctor?.fullName || appointment.doctor?.name || 'Doctor'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{appointment.doctor?.speciality || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{appointment.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{appointment.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{(() => {
                            const fee = (appointment.doctor?.fees ?? appointment.doctor?.fee ?? appointment.doctor?.appointmentFee);
                            return (typeof fee === 'number' && fee > 0) ? `${currencySymbol}${fee}` : '-';
                          })()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {appointment.status === 'PENDING' ? (
                            <button
                              onClick={() => handlePaymentClick(appointment)}
                              className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors cursor-pointer"
                            >
                              Pending for payment
                            </button>
                          ) : (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              (appointment.status === 'CONFIRMED' || appointment.status === 'APPROVED') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary hover:text-blue-900 mr-3">Details</button>
                          <button className="text-red-600 hover:text-red-900" onClick={async () => {
                            try {
                              await cancelAppointment(appointment.id);
                              setAppointments(prev => prev.map(a => a.id === appointment.id ? { ...a, status: 'CANCELLED' } : a));
                            } catch (e) {
                              console.error('Cancel failed', e);
                            }
                          }}>Cancel</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Removed Medications and Health tabs content (dummy data) */}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Notifications</h2>
              
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 rounded-lg border ${notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full mr-3 ${notification.read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                        <Bell className={`h-5 w-5 ${notification.read ? 'text-gray-500' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <button 
                          className="text-xs text-primary hover:text-blue-700"
                          onClick={() => {
                            notificationService.markAsRead(notification.id);
                          }}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      <PatientDashboardFooter />
      
      {/* Payment Options Modal */}
      {showPaymentModal && selectedAppointment && (
        <PaymentOptions
          appointment={selectedAppointment}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSelect={handlePaymentSelect}
        />
      )}
    </>
  );
};

export default PatientDashboard;