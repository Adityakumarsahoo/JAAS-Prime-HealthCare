import { useEffect, useState } from "react";
import { adminGetPendingPatients, adminApprovePatient } from "../../services/UserService";

const PendingPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminGetPendingPatients();
      setPatients(data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load pending patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    try {
      await adminApprovePatient(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed to approve patient");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Pending Patients</h1>
        <button className="btn btn-primary" onClick={load}>Refresh</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && patients.length === 0 && <p>No pending patients.</p>}
      {!loading && patients.length > 0 && (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{p.fullName}</td>
                  <td className="p-3">{p.email}</td>
                  <td className="p-3"><span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">{p.status || "PENDING"}</span></td>
                  <td className="p-3">
                    <button
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                      onClick={() => approve(p.id)}
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingPatients;