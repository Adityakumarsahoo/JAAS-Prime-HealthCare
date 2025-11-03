import { useEffect, useState } from 'react';
import { getMyDoctorAppointments, updateAppointmentStatus } from '../services/UserService.jsx';
import { CheckCircle, XCircle, Clock, User, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import notificationService from '../services/NotificationService.jsx';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await getMyDoctorAppointments();
        setAppointments(res.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleApprove = async (appointmentId) => {
    try {
      setProcessingIds(prev => new Set(prev).add(appointmentId));
      await updateAppointmentStatus(appointmentId, 'APPROVED');
      
      setAppointments(prev => 
        prev.map(appt => 
          appt.id === appointmentId 
            ? { ...appt, status: 'APPROVED' } 
            : appt
        )
      );
      
      toast.success('Appointment approved successfully!');
      
      // Send notification to patient
      const appointment = appointments.find(appt => appt.id === appointmentId);
      if (appointment && appointment.patient?.email) {
        notificationService.notifyAppointmentApproved(
          appointment.patient.email,
          {
            date: appointment.date,
            time: appointment.time,
            doctorName: appointment.doctor?.name || 'Doctor'
          }
        );
      }
      
    } catch (err) {
      console.error('Failed to approve appointment:', err);
      toast.error('Failed to approve appointment');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  };

  const handleReject = async (appointmentId) => {
    try {
      setProcessingIds(prev => new Set(prev).add(appointmentId));
      await updateAppointmentStatus(appointmentId, 'REJECTED');
      
      setAppointments(prev => 
        prev.map(appt => 
          appt.id === appointmentId 
            ? { ...appt, status: 'REJECTED' } 
            : appt
        )
      );
      
      toast.success('Appointment rejected successfully!');
      
      // Send notification to patient
      const appointment = appointments.find(appt => appt.id === appointmentId);
      if (appointment && appointment.patient?.email) {
        notificationService.notifyAppointmentRejected(
          appointment.patient.email,
          {
            date: appointment.date,
            time: appointment.time,
            doctorName: appointment.doctor?.name || 'Doctor'
          }
        );
      }
      
    } catch (err) {
      console.error('Failed to reject appointment:', err);
      toast.error('Failed to reject appointment');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canModifyStatus = (status) => {
    return status?.toUpperCase() === 'PENDING';
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Appointments</h1>
        <p className="text-gray-600">Manage your patient appointments</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Loading appointments...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!loading && appointments.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No appointments found.</p>
          <p className="text-gray-500">Your upcoming appointments will appear here.</p>
        </div>
      )}

      {!loading && appointments.length > 0 && (
        <div className="grid gap-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Patient Info */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appt.patient?.fullName || appt.patient?.name || 'Unknown Patient'}
                      </h3>
                      <p className="text-sm text-gray-600">{appt.patient?.email || ''}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {appt.date}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {appt.time}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appt.status)}`}>
                      {appt.status || 'PENDING'}
                    </span>

                    {canModifyStatus(appt.status) && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(appt.id)}
                          disabled={processingIds.has(appt.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {processingIds.has(appt.id) ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(appt.id)}
                          disabled={processingIds.has(appt.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {processingIds.has(appt.id) ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;