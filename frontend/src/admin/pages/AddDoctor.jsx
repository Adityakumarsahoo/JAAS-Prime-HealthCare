import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAddDoctor } from "../../services/UserService";
import { toast } from "react-toastify";

const AddDoctor = () => {
  const [doctor, setDoctor] = useState({
    fullName: "",
    speciality: "",
    email: "",
    password: "",
    phone: "",
    experience: "",
    fees: "",
    image: "",
  });

  const [preview, setPreview] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctor({ ...doctor, [name]: value });
    if (name === "image") setPreview(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullName = (doctor.fullName || "").trim();
    const speciality = (doctor.speciality || "").trim();
    const email = (doctor.email || "").trim();
    const password = (doctor.password || "").trim();
    const feesVal = doctor.fees === "" ? "" : Number(doctor.fees);
    if (!fullName || !speciality || !email || !password || feesVal === "") {
      toast.error("Please fill all required fields!");
      return;
    }

    try {
      const payload = {
        fullName,
        email,
        password,
        speciality,
        about: doctor.about || "",
        fees: Number(doctor.fees) || 0,
        image: doctor.image || "",
        available: true,
        featured: false,
      };
      const { data } = await adminAddDoctor(payload);
      if (data && data.id) {
        toast.success("Doctor added successfully!");
        navigate("/admin/doctors");
      } else {
        toast.error(data?.message || "Failed to add doctor");
      }
    } catch (err) {
      console.error(err);
      // Prefer server-provided message when available
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      toast.error(msg || "Failed to add doctor");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-[#F9FAFB]">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Doctor</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl p-6 max-w-2xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-gray-600 font-medium">Full Name *</label>
            <input
              name="fullName"
              value={doctor.fullName}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full"
              placeholder="Dr. John Smith"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-600 font-medium">Speciality *</label>
            <select
              name="speciality"
              value={doctor.speciality}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full"
              required
            >
              <option value="" disabled>Select Speciality</option>
              <option value="General physician">General physician</option>
              <option value="Gynecologist">Gynecologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Pediatricians">Pediatricians</option>
              <option value="Neurologist">Neurologist</option>
              <option value="Gastroenterologist">Gastroenterologist</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-gray-600 font-medium">Email *</label>
            <input
              name="email"
              value={doctor.email}
              onChange={handleChange}
              type="email"
              className="border rounded-lg p-2 w-full"
              placeholder="doctor@example.com"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-600 font-medium">Password *</label>
            <input
              name="password"
              value={doctor.password}
              onChange={handleChange}
              type="password"
              className="border rounded-lg p-2 w-full"
              placeholder="Enter a secure password"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-600 font-medium">Phone</label>
            <input
              name="phone"
              value={doctor.phone}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full"
              placeholder="+91 9876543210"
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-600 font-medium">Experience (years)</label>
            <input
              name="experience"
              value={doctor.experience}
              onChange={handleChange}
              type="number"
              className="border rounded-lg p-2 w-full"
            />
          </div>
        <div>
            <label className="block mb-2 text-gray-600 font-medium">Appointment Fee *</label>
            <input
              name="fees"
              value={doctor.fees}
              onChange={handleChange}
              type="number"
              min="0"
              step="1"
              className="border rounded-lg p-2 w-full"
              placeholder="e.g., 500"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-600 font-medium">Image URL</label>
            <input
              type="url"
              name="image"
              value={doctor.image}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full"
              placeholder="https://example.com/photo.jpg"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block mb-2 text-gray-600 font-medium">About / Bio</label>
            <textarea
              name="about"
              value={doctor.about}
              onChange={handleChange}
              rows={4}
              className="border rounded-lg p-2 w-full"
              placeholder="Short bio about the doctor"
            />
          </div>
        </div>

        {doctor.image && (
          <div className="mt-4">
            <p className="text-gray-600 mb-2 font-medium">Image Preview:</p>
            <img
              src={doctor.image}
              alt="preview"
              className="w-32 h-32 object-cover rounded-lg border"
            />
          </div>
        )}

        <button
          type="submit"
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
        >
          Add Doctor
        </button>
      </form>

      {/* Admin add flow now goes to Doctors List page */}
    </div>
  );
};

export default AddDoctor;
