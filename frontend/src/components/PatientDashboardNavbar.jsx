import { useContext, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, LogOut, User } from 'lucide-react';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';

const PatientDashboardNavbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userData, setAToken, setUserData } = useContext(AppContext);

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('aToken');
    localStorage.removeItem('role');
    
    // Clear context
    setAToken("");
    setUserData(null);
    
    // Redirect to login
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
          <img className="w-8 h-8" src={assets.medical_icon} alt="Medical Icon" />
          <span className="text-2xl font-bold text-primary">JAAS</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/patient-dashboard" className="text-gray-700 hover:text-primary font-medium">Dashboard</Link>
          <Link to="/patient-dashboard/appointments" className="text-gray-700 hover:text-primary font-medium">Appointments</Link>
          <Link to="/patient-dashboard/doctors" className="text-gray-700 hover:text-primary font-medium">Find Doctors</Link>
          <Link to="/patient-dashboard/profile" className="text-gray-700 hover:text-primary font-medium">My Profile</Link>
        </div>

        {/* User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="relative" onClick={() => navigate('/patient-dashboard#notifications')}>
            <Bell className="h-6 w-6 text-gray-600 cursor-pointer hover:text-primary transition-colors" />
          </div>
          
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img className="w-10 h-10 rounded-full border-2 border-primary" src={userData?.image || assets.profile_pic} alt="Profile" />
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-white shadow-lg rounded-lg flex flex-col gap-2 p-4">
                <Link to="/patient-dashboard/profile" className="flex items-center gap-2 hover:text-primary">
                  <User size={16} />
                  <span>My Profile</span>
                </Link>
                <button onClick={logout} className="flex items-center gap-2 hover:text-primary">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4">
          <div className="flex flex-col space-y-4">
            <Link to="/patient-dashboard" className="text-gray-700 hover:text-primary font-medium">Dashboard</Link>
            <Link to="/my-appointments" className="text-gray-700 hover:text-primary font-medium">Appointments</Link>
            <Link to="/doctors" className="text-gray-700 hover:text-primary font-medium">Find Doctors</Link>
            <Link to="/patient-dashboard/profile" className="text-gray-700 hover:text-primary font-medium">My Profile</Link>
            <button onClick={logout} className="flex items-center gap-2 text-gray-700 hover:text-primary font-medium">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PatientDashboardNavbar;