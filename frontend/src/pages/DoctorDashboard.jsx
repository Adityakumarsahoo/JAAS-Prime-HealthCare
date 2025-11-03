import { useCallback, useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ChevronRight, Users, DollarSign } from "lucide-react";
import PropTypes from 'prop-types';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { getMyDoctorAppointments } from '../services/UserService.jsx';

import DoctorDashboardFooter from '../components/DoctorDashboardFooter';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { backendUrl, aToken } = useContext(AppContext);
  const [doctorName, setDoctorName] = useState('');
  const [loadingName, setLoadingName] = useState(false);
  const [doctorFees, setDoctorFees] = useState(0);

  // Initialize name from localStorage immediately to avoid blank welcome
  useEffect(() => {
    const storedNameRaw = localStorage.getItem('fullName');
    const storedName = storedNameRaw ? storedNameRaw.trim() : '';
    if (storedName) setDoctorName(storedName);
  }, []);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        setLoadingName(true);
        const res = await axios.get(`${backendUrl}/api/doctors/profile`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        const fullName = res?.data?.fullName || '';
        const fees = Number(res?.data?.fees ?? res?.data?.fee ?? 0);
        const storedNameRaw = localStorage.getItem('fullName');
        const storedName = storedNameRaw ? storedNameRaw.trim() : '';
        setDoctorName(fullName || storedName);
        if (!Number.isNaN(fees) && fees > 0) setDoctorFees(fees);
      } catch {
        // ignore
      } finally {
        setLoadingName(false);
      }
    };
    if (aToken) fetchDoctorProfile();
  }, [aToken, backendUrl]);

  const sanitizedName = doctorName ? doctorName.replace(/^(dr\.?\s*)+/i, '').trim() : '';
  // derive name from stored email if full name is missing
  const emailLocal = (() => {
    const raw = localStorage.getItem('email');
    if (!raw) return '';
    const local = String(raw).split('@')[0] || '';
    return local.replace(/[^a-zA-Z\s]/g, ' ').trim().replace(/\s+/g, ' ');
  })();
  const emailDerivedName = emailLocal ? emailLocal.charAt(0).toUpperCase() + emailLocal.slice(1) : '';
  const displayName = sanitizedName || emailDerivedName || 'Doctor';
  const handleTabChange = useCallback((tab) => setActiveTab(tab), []);

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const totalIncome = appointments.reduce((sum, a) => {
    const fee = Number(a.fee ?? a.amount ?? a.doctor?.fees ?? a.docData?.fees ?? doctorFees ?? 0);
    if (Number.isNaN(fee)) return sum;
    return sum + (a.status === 'CONFIRMED' ? fee : 0);
  }, 0);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const res = await getMyDoctorAppointments();
        const list = Array.isArray(res.data) ? res.data : [];
        setAppointments(list);
        const seen = new Map();
        list.forEach(a => {
          const p = a.patient;
          if (p && (p.email || p.id)) {
            const key = p.email || p.id;
            if (!seen.has(key)) {
              seen.set(key, {
                id: p.id || key,
                name: p.fullName || p.name || 'Patient',
                age: p.age || '',
                lastVisit: a.date || '',
                condition: p.condition || ''
              });
            }
          }
        });
        setPatients(Array.from(seen.values()));
      } catch (err) {
        console.error('Failed to load doctor appointments', err);
      }
    };
    loadAppointments();
  }, []);

  return (
    <div className="flex">
      
      <div className="flex-1">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
              <p className="text-gray-600">
                {loadingName ? 'Loading...' : `Welcome Dr. ${displayName}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Today&apos;s Appointments</p>
                  <h3 className="text-2xl font-bold text-gray-800">{appointments.filter(a => a.date === new Date().toISOString().slice(0,10)).length}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
              <Link to="#overview" className="text-primary text-sm font-medium flex items-center mt-4 hover:underline" onClick={() => setActiveTab('overview')}>
                View Schedule <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Total Patients</p>
                  <h3 className="text-2xl font-bold text-gray-800">{patients.length}</h3>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <Link to="#patients" className="text-green-500 text-sm font-medium flex items-center mt-4 hover:underline" onClick={() => handleTabChange('patients')}>
                View Patients <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Total Income</p>
                  <h3 className="text-2xl font-bold text-gray-800">{
                    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalIncome)
                  }</h3>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-amber-500" />
                </div>
              </div>
              <span className="text-amber-600 text-sm font-medium mt-4 block">
                Based on confirmed appointments
              </span>
            </div>

            {/* Removed dummy Pending Reports and Patients Seen cards */}
          </div>

          <div className="bg-white rounded-xl shadow-md mb-8">
            <div className="flex border-b overflow-x-auto">
              <button 
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => handleTabChange('overview')}
              >
                Overview
              </button>
              {/* Removed Schedule tab (placeholder content) */}
              <button 
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'patients' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => handleTabChange('patients')}
              >
                Patients
              </button>
              {/* Removed Reports and Messages tabs (dummy content) */}
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Today&apos;s Schedule</h2>
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-700">Upcoming Appointments</h3>
                      <button onClick={() => handleTabChange('schedule')} className="text-primary text-sm hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                      {appointments.slice(0,5).map((appt, index) => (
                        <div key={index} className={`p-4 rounded-lg flex items-center justify-between ${
                          (appt.status === 'CONFIRMED') ? 'bg-blue-50' : 
                          (appt.status === 'PENDING') ? 'bg-yellow-50' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center">
                            <div className={`p-3 rounded-full mr-4 ${
                              (appt.status === 'CONFIRMED') ? 'bg-blue-100' : 
                              (appt.status === 'PENDING') ? 'bg-yellow-100' : 'bg-gray-100'
                            }`}>
                              <Clock className={`h-5 w-5 ${
                                (appt.status === 'CONFIRMED') ? 'text-primary' : 
                                (appt.status === 'PENDING') ? 'text-yellow-600' : 'text-gray-500'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{appt.time || ''}</p>
                              <p className="text-sm text-gray-600">{appt.patient?.fullName || appt.patient?.name || 'Patient'}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            (appt.status === 'CONFIRMED') ? 'bg-blue-100 text-blue-800' : 
                            (appt.status === 'PENDING') ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-800'
                          }`}>
                            {appt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-700">Recent Patients</h3>
                      <button onClick={() => handleTabChange('patients')} className="text-primary text-sm hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {patients.map((patient) => (
                            <tr key={patient.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-gray-500" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.age || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.lastVisit || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.condition || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button type="button" className="text-primary hover:text-indigo-900" onClick={() => handleTabChange('patients')}>View</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Removed Schedule tab content (dummy) */}

              {activeTab === 'patients' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Patients</h2>
                  <p className="text-gray-500">Complete patient list with detailed information would be displayed here.</p>
                </div>
              )}

              {/* Removed Reports and Messages content (dummy) */}
            </div>
          </div>
        </div>
        <DoctorDashboardFooter />
      </div>
    </div>
  );
};

DoctorDashboardFooter.propTypes = {
  // Add props if any are passed to DoctorDashboardFooter
};

export default DoctorDashboard;