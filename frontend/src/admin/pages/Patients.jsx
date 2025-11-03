import { useEffect, useState } from "react";
import { adminGetAllUsers } from "../../services/UserService";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const { data } = await adminGetAllUsers();
      const list = Array.isArray(data) ? data : [];
      const normalized = list.map((p) => ({
        id: p.id ?? p._id ?? Math.random().toString(36).slice(2),
        fullName: p.fullName ?? p.name ?? "",
        email: p.email ?? "",
        role: p.role ?? "PATIENT",
      }));
      setPatients(normalized);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      alert("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Patients</h2>
        <p className="text-gray-500">Total: {patients.length}</p>
      </div>
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 border-b">ID</th>
              <th className="py-3 px-4 border-b">Full Name</th>
              <th className="py-3 px-4 border-b">Email</th>
              <th className="py-3 px-4 border-b">Role</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">{p.id}</td>
                <td className="py-3 px-4 border-b">{p.fullName}</td>
                <td className="py-3 px-4 border-b">{p.email}</td>
                <td className="py-3 px-4 border-b">{String(p.role)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Patients;