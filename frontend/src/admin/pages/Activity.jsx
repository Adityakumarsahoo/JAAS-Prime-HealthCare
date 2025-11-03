import { useState } from 'react';
import { Calendar, Clock, Filter, Search, User, UserCheck } from 'lucide-react';

const Activity = () => {
  const activities = [
    {
      id: 1,
      type: 'appointment_approved',
      user: 'Dr. Sarah Johnson',
      patient: 'Michael Brown',
      time: '2 hours ago',
      date: '15 Oct 2023'
    },
    {
      id: 2,
      type: 'new_doctor',
      user: 'Dr. Robert Williams',
      specialty: 'Cardiologist',
      time: '5 hours ago',
      date: '15 Oct 2023'
    },
    {
      id: 3,
      type: 'appointment_scheduled',
      user: 'Emma Davis',
      doctor: 'Dr. James Wilson',
      time: 'Yesterday',
      date: '14 Oct 2023'
    },
    {
      id: 4,
      type: 'appointment_cancelled',
      user: 'Thomas Anderson',
      doctor: 'Dr. Lisa Martinez',
      time: 'Yesterday',
      date: '14 Oct 2023'
    },
    {
      id: 5,
      type: 'new_patient',
      user: 'Jennifer Lopez',
      time: '2 days ago',
      date: '13 Oct 2023'
    },
    {
      id: 6,
      type: 'appointment_approved',
      user: 'Dr. David Miller',
      patient: 'Sophia Wilson',
      time: '2 days ago',
      date: '13 Oct 2023'
    },
    {
      id: 7,
      type: 'appointment_scheduled',
      user: 'Oliver Taylor',
      doctor: 'Dr. Emily Clark',
      time: '3 days ago',
      date: '12 Oct 2023'
    },
    {
      id: 8,
      type: 'new_doctor',
      user: 'Dr. Olivia Thompson',
      specialty: 'Neurologist',
      time: '4 days ago',
      date: '11 Oct 2023'
    },
    {
      id: 9,
      type: 'appointment_approved',
      user: 'Dr. William Brown',
      patient: 'Charlotte Davis',
      time: '5 days ago',
      date: '10 Oct 2023'
    },
    {
      id: 10,
      type: 'new_patient',
      user: 'James Wilson',
      time: '6 days ago',
      date: '9 Oct 2023'
    }
  ];

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.patient && activity.patient.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (activity.doctor && activity.doctor.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    return activity.type.includes(filter) && matchesSearch;
  });

  const getActivityIcon = (type) => {
    switch (type) {
      case 'appointment_approved':
        return <div className="p-2 bg-green-100 rounded-full"><UserCheck className="w-5 h-5 text-green-600" /></div>;
      case 'appointment_scheduled':
        return <div className="p-2 bg-blue-100 rounded-full"><Calendar className="w-5 h-5 text-blue-600" /></div>;
      case 'appointment_cancelled':
        return <div className="p-2 bg-red-100 rounded-full"><Clock className="w-5 h-5 text-red-600" /></div>;
      case 'new_doctor':
        return <div className="p-2 bg-purple-100 rounded-full"><User className="w-5 h-5 text-purple-600" /></div>;
      case 'new_patient':
        return <div className="p-2 bg-yellow-100 rounded-full"><User className="w-5 h-5 text-yellow-600" /></div>;
      default:
        return <div className="p-2 bg-gray-100 rounded-full"><User className="w-5 h-5 text-gray-600" /></div>;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'appointment_approved':
        return (
          <p className="text-gray-700">
            <span className="font-medium text-gray-900">{activity.user}</span> approved appointment for <span className="font-medium text-gray-900">{activity.patient}</span>
          </p>
        );
      case 'appointment_scheduled':
        return (
          <p className="text-gray-700">
            <span className="font-medium text-gray-900">{activity.user}</span> scheduled an appointment with <span className="font-medium text-gray-900">{activity.doctor}</span>
          </p>
        );
      case 'appointment_cancelled':
        return (
          <p className="text-gray-700">
            <span className="font-medium text-gray-900">{activity.user}</span> cancelled appointment with <span className="font-medium text-gray-900">{activity.doctor}</span>
          </p>
        );
      case 'new_doctor':
        return (
          <p className="text-gray-700">
            <span className="font-medium text-gray-900">{activity.user}</span> joined as a new {activity.specialty}
          </p>
        );
      case 'new_patient':
        return (
          <p className="text-gray-700">
            <span className="font-medium text-gray-900">{activity.user}</span> registered as a new patient
          </p>
        );
      default:
        return <p className="text-gray-700">{activity.user} performed an action</p>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search activities..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Activities</option>
              <option value="appointment">Appointments</option>
              <option value="new">New Users</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start space-x-4">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  {getActivityText(activity)}
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{activity.time}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{activity.date}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No activities found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;