import { useMemo, useState } from "react";
import { HelpCircle, Search, Mail, Phone, BookOpen } from "lucide-react";

const HelpCenter = () => {
  const topics = useMemo(
    () => [
      { category: "Getting Started", items: [
          { title: "Overview", content: "Learn the basics of the admin panel and its key sections: Dashboard, Appointments, Doctors, Pending Approvals, and Settings." },
          { title: "Navigation", content: "Use the left sidebar to move between admin sections. Each page includes context actions at the top." },
        ] },
      { category: "Appointments", items: [
          { title: "Booking Flow", content: "Patients book via the public site. New bookings appear under Admin  Appointments and Pending Approvals if status is PENDING." },
          { title: "Approve/Reject", content: "Use the Pending Approvals page to approve or reject appointments, or Approve All for bulk review." },
        ] },
      { category: "Doctors", items: [
          { title: "Add Doctor", content: "Go to Admin  Add Doctor to create a doctor profile. Ensure email is unique." },
          { title: "Edit/Remove", content: "Manage doctor details under Admin  Doctor List. You can edit specialities and remove entries." },
        ] },
      { category: "Notifications", items: [
          { title: "Email", content: "Toggle email notifications in Settings  Notifications. Appointment booking emails can be sent to your configured address." },
          { title: "SMS", content: "Enable SMS for urgent updates in Settings  Notifications and set your admin phone number under General." },
        ] },
      { category: "Security", items: [
          { title: "Password", content: "Update admin password in Settings  Security. Ensure the new password and confirmation match." },
          { title: "Roles", content: "Admin access is required for approvals and doctor management. Patient and Doctor roles have limited access." },
        ] },
      { category: "Appearance", items: [
          { title: "Dark Mode", content: "Toggle Light/Dark mode in Settings  General. The theme applies across the admin panel when enabled." },
        ] },
    ],
    []
  );

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.map((t) => ({
      category: t.category,
      items: t.items.filter(
        (i) => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      ),
    })).filter((t) => t.items.length > 0);
  }, [topics, query]);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <HelpCircle className="w-8 h-8 mr-3 text-primary" /> Help Center
          </h1>
          <p className="text-gray-500 mt-1">Find answers and guidance for common admin tasks</p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search help topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-600">No topics match your search. Try a different keyword.</p>
            </div>
          ) : (
            filtered.map((section) => (
              <div key={section.category} className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-primary" />
                  {section.category}
                </h2>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.title} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-3">Contact Support</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-primary" />
                <a href="mailto:toadityakumarsahoo@gmail.com" className="text-primary hover:underline">toadityakumarsahoo@gmail.com</a>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-primary" />
                <span>Admin Phone (set in Settings  General)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
            <ul className="space-y-2 text-sm">
              <li><a className="text-primary hover:underline" href="/admin/settings">Settings</a></li>
              <li><a className="text-primary hover:underline" href="/admin/pending-approvals">Pending Approvals</a></li>
              <li><a className="text-primary hover:underline" href="/admin/doctors">Doctors</a></li>
              <li><a className="text-primary hover:underline" href="/admin/appointments">Appointments</a></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HelpCenter;

