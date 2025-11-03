import { useState } from "react";
import { HelpCircle, Mail, Phone } from "lucide-react";

const PatientHelp = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const adminEmail = "toadityakumarsahoo@gmail.com";
  const adminPhone = "+1 (555) 123-4567";

  const handleEmailAdmin = (e) => {
    e.preventDefault();
    const mailto = `mailto:${adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold text-gray-800">Help & Support</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Contact Admin</h2>
          <form onSubmit={handleEmailAdmin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Issue with booking appointment"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your issue or question..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors">
                Email Admin
              </button>
              <a
                href={`tel:${adminPhone.replace(/[^+\d]/g, "")}`}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4" /> Call Admin
              </a>
            </div>
          </form>
        </div>

        <aside className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-3">Admin Contact</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-primary" />
                <a href={`mailto:${adminEmail}`} className="text-primary hover:underline">{adminEmail}</a>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-primary" />
                <span>{adminPhone}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PatientHelp;