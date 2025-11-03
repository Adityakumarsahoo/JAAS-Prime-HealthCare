import { createContext, useState } from 'react';
import PropTypes from 'prop-types';
import { doctors as localDoctors } from "../assets/assets";
import axios from 'axios';

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [aToken, setAToken] = useState(localStorage.getItem("aToken") || "");
  const [doctors, setDoctors] = useState(localDoctors || []);
  const [userData, setUserData] = useState(null);

  // Function to update token
  const updateToken = (token) => {
    if (token) {
      localStorage.setItem("aToken", token);
    } else {
      localStorage.removeItem("aToken");
    }
    setAToken(token || "");
  };

  // Backend base URL from Vite env, defaulting to Spring Boot local port
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  // Load doctors data from backend
  const getDoctosData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctors`);
      const normalized = (Array.isArray(data) ? data : []).map((d) => ({
        _id: d.id ?? d._id ?? d.email,
        name: d.fullName ?? d.name ?? "",
        speciality: d.speciality ?? "",
        image: d.image ?? "/default-doctor.png",
        available: d.available ?? true,
        about: d.about ?? "",
        fees: typeof d.fees === 'number' ? d.fees : Number(d.fees ?? d.fee ?? d.appointmentFee ?? 0),
      }));
      setDoctors(normalized);
      return normalized;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      // Fallback to local data if backend fails
      setDoctors(localDoctors);
      return localDoctors;
    }
  };

  // Load user profile data function that works without backend
  const loadUserProfileData = async () => {
    // This function now just returns the local data
    return userData;
  };

  const value = {
    aToken,
    setAToken,
    doctors,
    setDoctors,
    userData,
    setUserData,
    backendUrl,
    loadUserProfileData,
    getDoctosData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AppContextProvider;
