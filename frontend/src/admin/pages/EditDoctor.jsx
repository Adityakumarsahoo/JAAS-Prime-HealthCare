import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    speciality: "",
    about: "",
    image: "",
  });

  const token = localStorage.getItem("aToken");

  const fetchDoctor = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/doctors/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const d = res.data || {};
      setFormData({
        fullName: d.fullName || "",
        email: d.email || "",
        speciality: d.speciality || "",
        about: d.about || "",
        image: d.image || "",
      });
    } catch (err) {
      console.error(err);
    }
  }, [id, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        speciality: formData.speciality,
        about: formData.about,
        image: formData.image,
      };
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/doctors/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Doctor updated successfully");
      navigate("/admin/doctors");
    } catch (err) {
      console.error(err);
      alert("Failed to update doctor");
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Edit Doctor</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded-lg">
        <label className="block mb-2 font-medium">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-2 font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-2 font-medium">Speciality</label>
        <select
          name="speciality"
          value={formData.speciality}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="General physician">General physician</option>
          <option value="Gynecologist">Gynecologist</option>
          <option value="Dermatologist">Dermatologist</option>
          <option value="Pediatricians">Pediatricians</option>
          <option value="Neurologist">Neurologist</option>
          <option value="Gastroenterologist">Gastroenterologist</option>
        </select>

        <label className="block mb-2 font-medium">About / Bio</label>
        <textarea
          name="about"
          value={formData.about}
          onChange={handleChange}
          rows={4}
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-2 font-medium">Image URL</label>
        <input
          type="url"
          name="image"
          value={formData.image}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Doctor
        </button>
      </form>
    </div>
  );
};

export default EditDoctor;
