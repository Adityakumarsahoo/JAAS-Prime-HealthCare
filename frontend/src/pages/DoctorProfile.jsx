import { useEffect, useState, useContext, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorProfile = () => {
  const { backendUrl, aToken, getDoctosData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    id: "",
    fullName: "",
    email: "",
    speciality: "",
    about: "",
    image: "",
    available: true,
  });
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${backendUrl}/api/doctors/profile`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      const data = res?.data || {};
      setProfile((prev) => ({
        ...prev,
        id: data.id ?? "",
        fullName: data.fullName ?? "",
        email: data.email ?? "",
        speciality: data.speciality ?? "",
        about: data.about ?? "",
        image: data.image ?? "",
        available: data.available ?? true,
      }));
    } catch (e) {
      console.error("Failed to load doctor profile", e);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [backendUrl, aToken]);

  useEffect(() => {
    if (aToken) fetchProfile();
  }, [aToken, fetchProfile]);

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = { ...profile };
      // include password if provided and confirmed
      const np = passwords.newPassword?.trim();
      const cp = passwords.confirmPassword?.trim();
      if (np) {
        if (np !== cp) {
          toast.error("Passwords do not match");
          setSaving(false);
          return;
        }
        payload.password = np;
      }

      await axios.put(`${backendUrl}/api/doctors/${profile.id}`, payload, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      toast.success("Profile updated");
      // Keep localStorage in sync so dashboards greet with the latest name
      try {
        const newName = (payload.fullName || '').trim();
        if (newName) localStorage.setItem('fullName', newName);
      } catch {}
      setPasswords({ newPassword: "", confirmPassword: "" });
      // Refresh doctors listing so availability reflects everywhere
      try { await getDoctosData(); } catch {}
    } catch (e) {
      console.error("Failed to save profile", e);
      setError("Failed to save profile");
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => setProfile((p) => ({ ...p, [field]: value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-indigo-700 mb-6">Your Profile</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                <input className="w-full border rounded px-3 py-2" value={profile.fullName} onChange={(e) => handleChange("fullName", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input className="w-full border rounded px-3 py-2 bg-gray-100" value={profile.email} readOnly />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Speciality</label>
                <input className="w-full border rounded px-3 py-2" value={profile.speciality} onChange={(e) => handleChange("speciality", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Image URL</label>
                <input className="w-full border rounded px-3 py-2" value={profile.image} onChange={(e) => handleChange("image", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">About</label>
                <textarea className="w-full border rounded px-3 py-2" rows={4} value={profile.about} onChange={(e) => handleChange("about", e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Availability</label>
              <button
                type="button"
                className={`px-4 py-2 rounded-full text-sm ${profile.available ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}
                onClick={() => handleChange("available", !profile.available)}
              >
                {profile.available ? "Available" : "Not Available"}
              </button>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-indigo-700 mb-3">Change Password</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">New Password</label>
                  <input type="password" className="w-full border rounded px-3 py-2" value={passwords.newPassword} onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
                  <input type="password" className="w-full border rounded px-3 py-2" value={passwords.confirmPassword} onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={saveProfile} disabled={saving} className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={fetchProfile} className="px-5 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;