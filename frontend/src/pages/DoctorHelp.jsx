import { useState } from "react";
import { HelpCircle, Mail, Phone, User } from "lucide-react";

const DoctorHelp = () => {
  const [adminSubject, setAdminSubject] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientSubject, setPatientSubject] = useState("");
  const [patientMessage, setPatientMessage] = useState("");

  const adminEmail = "toadityakumarsahoo@gmail.com";
  const adminPhone = "+1 (555) 123-4567";

  const emailAdmin = (e) => {
    e.preventDefault();
    const mailto = `mailto:${adminEmail}?subject=${encodeURIComponent(adminSubject)}&body=${encodeURIComponent(adminMessage)}`;
    window.location.href = mailto;
  };

  const emailPatient = (e) => {
    e.preventDefault();
    if (!patientEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(patientEmail)) {
      alert("Please enter a valid patient email.");
      return;
    }
    const mailto = `mailto:${patientEmail}?subject=${encodeURIComponent(patientSubject)}&body=${encodeURIComponent(patientMessage)}`;
    window.location.href = mailto;
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-800">Help & Support</h1>
        </div>
        <p className="text-gray-600 mb-6">Quick resources and direct contact options.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Admin */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-800">Contact Admin</h2>
            </div>
            <form onSubmit={emailAdmin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Subject</label>
                <input
                  type="text"
                  value={adminSubject}
                  onChange={(e) => setAdminSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., System issue or urgent notice"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Message</label>
                <textarea
                  rows={6}
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe your issue or request..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
                  Email Admin
                </button>
                <a
                  href={`tel:${adminPhone.replace(/[^+\d]/g, "")}`}
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" /> Call Admin
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-2">This opens your default mail client.</p>
            </form>
            <div className="mt-4 text-sm text-gray-700">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                <a href={`mailto:${adminEmail}`} className="text-primary hover:underline">{adminEmail}</a>
              </div>
              <div className="flex items-center mt-2">
                <Phone className="w-4 h-4 mr-2 text-primary" />
                <span>{adminPhone}</span>
              </div>
            </div>
          </div>

          {/* Contact Patient */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-800">Contact Patient</h2>
            </div>
            <form onSubmit={emailPatient} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Patient Email</label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="patient@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Subject</label>
                <input
                  type="text"
                  value={patientSubject}
                  onChange={(e) => setPatientSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Appointment update"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Message</label>
                <textarea
                  rows={6}
                  value={patientMessage}
                  onChange={(e) => setPatientMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Type your message to the patient..."
                  required
                />
              </div>
              <button type="submit" className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors">
                Email Patient
              </button>
              <p className="text-xs text-gray-500 mt-2">Uses your default mail app to send.</p>
            </form>
          </div>
        </div>

        {/* Quick tips */}
        <div className="mt-8 p-4 border rounded-lg bg-gray-50">
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Manage appointments under <span className="font-medium">Appointments</span> in the sidebar.</li>
            <li>Update your profile details under <span className="font-medium">Profile</span>.</li>
            <li>If your dashboard greeting shows a placeholder, re-login or update your profile name.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DoctorHelp;