import { useEffect, useState } from "react";
import { Check, X, Filter, Search, Calendar, Clock } from "lucide-react";
import { getAllAppointments, approveAppointment, rejectAppointment } from "../../services/UserService";

const PendingApprovals = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const handleApprove = async (id) => {
    try {
      await approveAppointment(id);
      setPendingApprovals(prev => prev.filter(approval => approval.id !== id));
    } catch (e) {
      console.error("Approve failed", e);
      alert("Failed to approve appointment");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectAppointment(id);
      setPendingApprovals(prev => prev.filter(approval => approval.id !== id));
    } catch (e) {
      console.error("Reject failed", e);
      alert("Failed to reject appointment");
    }
  };

  const approveAll = async () => {
    try {
      const ids = pendingApprovals.map(p => p.id);
      await Promise.all(ids.map(id => approveAppointment(id)));
      setPendingApprovals([]);
      alert("All pending approvals have been approved.");
    } catch (e) {
      console.error("Bulk approve failed", e);
      alert("Failed to approve all pending appointments");
    }
  };

  const filteredApprovals = pendingApprovals.filter(approval => {
    const matchesSearch = 
      approval.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "today") return approval.date.includes("24th July") && matchesSearch;
    if (selectedFilter === "tomorrow") return approval.date.includes("25th July") && matchesSearch;
    if (selectedFilter === "thisWeek") {
      const dates = ["24th July", "25th July", "26th July", "27th July", "28th July", "29th July", "30th July"];
      return dates.some(date => approval.date.includes(date)) && matchesSearch;
    }
    
    return matchesSearch;
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAllAppointments();
        const normalized = (Array.isArray(data) ? data : [])
          .filter(a => (a.status || '').toUpperCase() === 'PENDING')
          .map(a => ({
            id: a.id,
            doctorName: a.doctor?.fullName || a.doctorName || 'Unknown Doctor',
            specialty: a.doctor?.speciality || a.specialty || '',
            patientName: a.patient?.fullName || a.patientName || 'Unknown Patient',
            date: a.date,
            time: a.time,
            status: 'Pending',
            reason: a.reason || 'Appointment request',
          }));
        setPendingApprovals(normalized);
      } catch (e) {
        console.error('Failed to load appointments', e);
      }
    })();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Pending Approvals</h1>
        <p className="text-gray-500 mt-1">Manage appointment requests awaiting approval</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by doctor, patient or specialty..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:ring-2 focus:ring-primary focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <select 
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">All Appointments</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="thisWeek">This Week</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-400 mr-1"></div>
              Pending: {pendingApprovals.length}
            </span>
            {pendingApprovals.length > 0 && (
              <button
                onClick={approveAll}
                className="px-3 py-2 rounded-lg bg-primary text-white hover:opacity-90"
              >
                Approve All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApprovals.length > 0 ? (
                filteredApprovals.map((approval) => (
                  <tr key={approval.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                          {approval.doctorName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{approval.doctorName}</div>
                          <div className="text-sm text-gray-500">{approval.specialty}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{approval.patientName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{approval.date}</div>
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock size={16} className="text-gray-400 mr-2" />
                        <div className="text-sm text-gray-500">{approval.time}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{approval.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                        {approval.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(approval.id)}
                          className="bg-green-100 hover:bg-green-200 p-2 rounded-lg text-green-600 transition-colors"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(approval.id)}
                          className="bg-red-100 hover:bg-red-200 p-2 rounded-lg text-red-600 transition-colors"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    No pending approvals found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovals;