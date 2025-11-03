import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminGetAllDoctors, adminDeleteDoctor } from "../../services/UserService";

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDoctors = async () => {
    try {
      const { data } = await adminGetAllDoctors();
      // Normalize fields for table display
      const normalized = (Array.isArray(data) ? data : []).map((d) => ({
        _id: d.id,
        name: d.fullName || d.name || "",
        email: d.email || "",
        speciality: d.speciality || "",
        about: d.about || "",
        image: d.image || "/default-doctor.png",
      }));
      setDoctors(normalized);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      alert("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await adminDeleteDoctor(id);
      await fetchDoctors();
      alert("Doctor deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete doctor");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Doctors List</h2>
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 border-b">Photo</th>
              <th className="py-3 px-4 border-b">Name</th>
              <th className="py-3 px-4 border-b">Email</th>
              <th className="py-3 px-4 border-b">Speciality</th>
              <th className="py-3 px-4 border-b">About</th>
              <th className="py-3 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b"><img src={doctor.image} alt={doctor.name} className="w-12 h-12 rounded object-cover" /></td>
                <td className="py-3 px-4 border-b">{doctor.name}</td>
                <td className="py-3 px-4 border-b">{doctor.email}</td>
                <td className="py-3 px-4 border-b">{doctor.speciality}</td>
                <td className="py-3 px-4 border-b truncate max-w-xs" title={doctor.about}>{doctor.about}</td>
                <td className="py-3 px-4 border-b space-x-2">
                  <button
                    onClick={() => navigate(`/admin/edit-doctor/${doctor._id}`)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(doctor._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
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

export default DoctorsList;
