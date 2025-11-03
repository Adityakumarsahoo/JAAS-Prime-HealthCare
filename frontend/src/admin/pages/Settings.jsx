import { useEffect, useState } from "react";
import { Save, Bell, Lock, User, Globe, Moon, Sun } from "lucide-react";
import { toast } from "react-toastify";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, app: true, sms: false });
  const [formData, setFormData] = useState({
    hospitalName: "JAAS Medical Center",
    email: "admin@jaas.com",
    phone: "+1 (555) 123-4567",
    address: "123 Medical Drive, Healthcare City, HC 12345",
  });
  const [profile, setProfile] = useState({ adminName: "Admin User", adminEmail: "admin@jaas.com" });
  const [security, setSecurity] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("adminSettings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.general) {
          setFormData(parsed.general);
          setDarkMode(!!parsed.general.darkMode);
        }
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.profile) setProfile(parsed.profile);
      }
    } catch (e) {
      console.warn("Failed to load admin settings from storage", e);
    }
  }, []);

  // Apply theme instantly when toggled and persist darkMode key
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      const raw = localStorage.getItem("adminSettings");
      const settings = raw ? JSON.parse(raw) : {};
      settings.general = { ...(settings.general || {}), darkMode };
      localStorage.setItem("adminSettings", JSON.stringify(settings));
    } catch {}
  }, [darkMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNotificationChange = (type) => {
    setNotifications({ ...notifications, [type]: !notifications[type] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { general: { ...formData, darkMode }, notifications, profile };
    try {
      localStorage.setItem("adminSettings", JSON.stringify(payload));
      toast.success("Settings saved successfully");
    } catch (err) {
      console.error("Failed to persist settings", err);
      toast.error("Failed to save settings");
    }
  };

  const handleSecuritySave = (e) => {
    e.preventDefault();
    if (!security.currentPassword || !security.newPassword) {
      toast.warn("Please fill current and new password");
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    // TODO: Integrate with backend change password endpoint when available
    setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    toast.success("Password updated");
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your hospital administration settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Navigation */}
        <div className="bg-white rounded-xl shadow-md p-6 h-fit lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Settings Menu</h2>
          <ul className="space-y-2">
            <li className="p-2 bg-primary text-white rounded-lg font-medium">
              <a href="#general" className="flex items-center">
                <Globe className="w-5 h-5 mr-3" />
                General
              </a>
            </li>
            <li className="p-2 hover:bg-gray-100 rounded-lg">
              <a href="#notifications" className="flex items-center text-gray-700">
                <Bell className="w-5 h-5 mr-3" />
                Notifications
              </a>
            </li>
            <li className="p-2 hover:bg-gray-100 rounded-lg">
              <a href="#security" className="flex items-center text-gray-700">
                <Lock className="w-5 h-5 mr-3" />
                Security
              </a>
            </li>
            <li className="p-2 hover:bg-gray-100 rounded-lg">
              <a href="#profile" className="flex items-center text-gray-700">
                <User className="w-5 h-5 mr-3" />
                Profile
              </a>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Settings */}
          <div id="general" className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-primary" />
              General Settings
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                  <input
                    type="text"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  ></textarea>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-3">{darkMode ? "Dark Mode" : "Light Mode"}</span>
                    <button
                      type="button"
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${darkMode ? "bg-primary" : "bg-gray-300"}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${darkMode ? "translate-x-6" : "translate-x-1"}`}>
                        {darkMode ? <Moon className="h-3 w-3 m-1 text-gray-600" /> : <Sun className="h-3 w-3 m-1 text-amber-500" />}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Notification Settings */}
          <div id="notifications" className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-primary" />
              Notification Settings
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive email for appointment bookings</p>
                </div>
                <button onClick={() => handleNotificationChange("email")} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notifications.email ? "bg-primary" : "bg-gray-300"}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${notifications.email ? "translate-x-6" : "translate-x-1"}`}></span>
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h3 className="font-medium">App Notifications</h3>
                  <p className="text-sm text-gray-500">Receive in-app notifications</p>
                </div>
                <button onClick={() => handleNotificationChange("app")} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notifications.app ? "bg-primary" : "bg-gray-300"}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${notifications.app ? "translate-x-6" : "translate-x-1"}`}></span>
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium">SMS Notifications</h3>
                  <p className="text-sm text-gray-500">Receive text messages for urgent updates</p>
                </div>
                <button onClick={() => handleNotificationChange("sms")} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notifications.sms ? "bg-primary" : "bg-gray-300"}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${notifications.sms ? "translate-x-6" : "translate-x-1"}`}></span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Settings */}
          <div id="profile" className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              Profile Settings
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                <input type="text" value={profile.adminName} onChange={(e) => setProfile({ ...profile, adminName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                <input type="email" value={profile.adminEmail} onChange={(e) => setProfile({ ...profile, adminEmail: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div className="pt-2">
                <button onClick={handleSubmit} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </button>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div id="security" className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-primary" />
              Security
            </h2>
            <form onSubmit={handleSecuritySave}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input type="password" value={security.currentPassword} onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" value={security.newPassword} onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" value={security.confirmPassword} onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div className="pt-2">
                  <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Update Password
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;