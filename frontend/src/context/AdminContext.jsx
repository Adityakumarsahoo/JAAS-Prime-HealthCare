import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import PropTypes from 'prop-types';
import { adminGetAllDoctors, getAllAppointments as adminGetAllAppointments } from "../services/UserService";

export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '')

    const [appointments, setAppointments] = useState([])
    const [doctors, setDoctors] = useState([])
    const [dashData, setDashData] = useState({ totalDoctors: 0, totalAppointments: 0, totalUsers: 0 })

    // Load doctors from backend
    const getAllDoctors = async () => {
        try {
            const { data } = await adminGetAllDoctors();
            const list = Array.isArray(data) ? data : [];
            setDoctors(list);
        } catch (err) {
            console.error("AdminContext: getAllDoctors failed", err);
            toast.error("Failed to load doctors");
        }
    }
    
    // Load doctors on component mount
    useEffect(() => {
        getAllDoctors();
    }, []);

    // Function placeholder: availability changes should call backend (not implemented here)
    const changeAvailability = async () => {
        toast.info("Update availability via Edit Doctor until API is available");
    }

    // Load all appointments from backend
    const getAllAppointments = async () => {
        try {
            const { data } = await adminGetAllAppointments();
            const list = Array.isArray(data) ? data : [];
            setAppointments(list);
        } catch (err) {
            console.error("AdminContext: getAllAppointments failed", err);
            toast.error("Failed to load appointments");
        }
    }

    // Admin cancel via status update can be wired later; keep placeholder
    const cancelAppointment = async () => {
        toast.info("Use appointment actions on Admin pages");
    }

    // Compute dashboard metrics from loaded lists
    const getDashData = async () => {
        await Promise.all([getAllDoctors(), getAllAppointments()]);
        setDashData({
            totalDoctors: doctors.length,
            totalAppointments: appointments.length,
            totalUsers: 0 // extend with patient list if/when needed
        })
    }

    const value = {
        aToken, setAToken,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        getAllAppointments,
        getDashData,
        cancelAppointment,
        dashData
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )

}

export default AdminContextProvider

AdminContextProvider.propTypes = {
    children: PropTypes.node
}