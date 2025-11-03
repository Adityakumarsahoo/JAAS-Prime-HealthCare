import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import { Phone, Mail, MapPin } from "lucide-react";
import { assets } from '../assets/assets';

const DoctorDashboardFooter = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center mb-4">
              <img src={assets.medical_icon} alt="JAAS Medical" className="h-8 w-8 mr-2" />
              <span className="text-2xl font-bold text-white">JAAS</span>
            </Link>
            <p className="text-blue-100 mb-4">
              Providing quality healthcare services for doctors and patients.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/doctor-dashboard" className="text-blue-100 hover:text-white">Dashboard</Link></li>
              <li><Link to="/doctor-appointments" className="text-blue-100 hover:text-white">Appointments</Link></li>
              <li><Link to="/doctor-patients" className="text-blue-100 hover:text-white">Patients</Link></li>
              <li><Link to="/doctor-profile" className="text-blue-100 hover:text-white">My Profile</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/telemedicine" className="text-blue-100 hover:text-white">Telemedicine</Link></li>
              <li><Link to="/lab-results" className="text-blue-100 hover:text-white">Lab Results</Link></li>
              <li><Link to="/prescriptions" className="text-blue-100 hover:text-white">Prescriptions</Link></li>
              <li><Link to="/medical-records" className="text-blue-100 hover:text-white">Medical Records</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-blue-200" />
                <span className="text-blue-100">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-200" />
                <span className="text-blue-100">support@jaasmedical.com</span>
              </li>
              <li className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-200" />
                <span className="text-blue-100">123 Healthcare Ave, Medical City</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-blue-500 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-100 text-sm">© 2023 JAAS Medical. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="text-blue-100 hover:text-white">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-blue-100 hover:text-white">Terms of Service</Link>
            <Link to="/cookie-policy" className="text-blue-100 hover:text-white">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

DoctorDashboardFooter.propTypes = {
  // Add any props if they are passed to the component
};

export default DoctorDashboardFooter;