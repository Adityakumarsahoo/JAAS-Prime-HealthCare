import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { getAllAppointments, approveAppointment, rejectAppointment } from "../../services/UserService.jsx";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const normalize = useCallback((list) => {
    return (Array.isArray(list) ? list : []).map((a) => ({
      id: a.id ?? a._id,
      patient: a.patient?.fullName ?? a.patient?.name ?? a.patientName ?? "Patient",
      doctor: a.doctor?.fullName ?? a.doctor?.name ?? a.doctorName ?? "Doctor",
      date: a.date ?? a.slotDate ?? "",
      time: a.time ?? a.slotTime ?? "",
      status: a.status ?? "PENDING",
    }));
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getAllAppointments();
      const normalized = Array.isArray(data) ? data : data?.appointments;
      setAppointments(normalize(normalized));
    } catch (e) {
      console.error("Failed to load appointments", e);
      toast.error("Unable to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [normalize]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleApprove = async (id) => {
    try {
      await approveAppointment(id);
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "APPROVED" } : a)));
      toast.success("Appointment approved");
    } catch (e) {
      console.error("Approve failed", e);
      toast.error("Failed to approve appointment");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectAppointment(id);
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "REJECTED" } : a)));
      toast.info("Appointment rejected");
    } catch (e) {
      console.error("Reject failed", e);
      toast.error("Failed to reject appointment");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-[#F9FAFB]">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Appointments</h1>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        {loading && (
          <div className="p-4 text-sm text-gray-600">Loading appointments...</div>
        )}
        <table className="w-full border-collapse">
          <thead className="bg-indigo-50 text-gray-700">
            <tr>
              <th className="p-4 text-left">Patient</th>
              <th className="p-4 text-left">Doctor</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Time</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 && !loading && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan="6">No appointments found</td>
              </tr>
            )}
            {appointments.map((appt) => (
              <tr key={appt.id} className="border-t hover:bg-gray-50">
                <td className="p-4">{appt.patient}</td>
                <td className="p-4">{appt.doctor}</td>
                <td className="p-4">{appt.date}</td>
                <td className="p-4">{appt.time}</td>
                <td className="p-4 text-center font-semibold">
                  <span
                    className={`px-3 py-1 rounded-full ${
                      appt.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : appt.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {appt.status}
                  </span>
                </td>
                <td className="p-4 text-center flex justify-center gap-3">
                  <button
                    onClick={() => handleApprove(appt.id)}
                    className="bg-green-100 hover:bg-green-200 p-2 rounded-full"
                    title="Approve"
                  >
                    <CheckCircle className="text-green-600" size={18} />
                  </button>
                  <button
                    onClick={() => handleReject(appt.id)}
                    className="bg-red-100 hover:bg-red-200 p-2 rounded-full"
                    title="Reject"
                  >
                    <XCircle className="text-red-600" size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Appointments;
