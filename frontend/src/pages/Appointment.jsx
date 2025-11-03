import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import PropTypes from 'prop-types';
import axios from "axios";
import { toast } from "react-toastify";

const Appointment = () => {

    const { docId } = useParams()
    const { doctors, currencySymbol, backendUrl, aToken, getDoctosData } = useContext(AppContext)
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const [docInfo, setDocInfo] = useState(false)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')

    const navigate = useNavigate()

    const fetchDocInfo = useCallback(async () => {
        const docInfo = doctors.find((doc) => doc.id === Number(docId.replace('doc', '')) || String(doc._id) === String(docId))
        setDocInfo(docInfo)
    }, [doctors, docId]);

    const getAvailableSolts = useCallback(async () => {
        setDocSlots([])

        // getting current date
        let today = new Date()

        for (let i = 0; i < 7; i++) {

            // getting date with index 
            let currentDate = new Date(today)
            currentDate.setDate(today.getDate() + i)

            // setting end time of the date with index
            let endTime = new Date()
            endTime.setDate(today.getDate() + i)
            endTime.setHours(21, 0, 0, 0)

            // setting hours 
            if (today.getDate() === currentDate.getDate()) {
                currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
                currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
            } else {
                currentDate.setHours(10)
                currentDate.setMinutes(0)
            }

            let timeSlots = [];


            while (currentDate < endTime) {
                let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                let day = currentDate.getDate()
                let month = currentDate.getMonth() + 1
                let year = currentDate.getFullYear()

                const slotDate = day + "_" + month + "_" + year
                const slotTime = formattedTime

                // Check if slots_booked exists and has the date
                const isSlotAvailable = docInfo && docInfo.slots_booked && docInfo.slots_booked[slotDate] ? 
                    !docInfo.slots_booked[slotDate].includes(slotTime) : true

                if (isSlotAvailable) {

                    // Add slot to array
                    timeSlots.push({
                        datetime: new Date(currentDate),
                        time: formattedTime
                    })
                }

                // Increment current time by 30 minutes
                currentDate.setMinutes(currentDate.getMinutes() + 30);
            }

            setDocSlots(prev => ([...prev, timeSlots]))

        }

    }, [docInfo]);

    const bookAppointment = useCallback(async () => {
    if (!aToken) {
        toast.warning('Please login to book an appointment', { position: 'top-right' });
        return navigate('/login');
    }

    // Derive numeric doctorId from backend-loaded doctor `_id` or fallback to route param
    const derivedIdFromDoc = Number(docInfo?._id);
    const derivedIdFromRoute = Number(String(docId).replace('doc', ''));
    const doctorNumericId = Number.isFinite(derivedIdFromDoc) ? derivedIdFromDoc : derivedIdFromRoute;

    // Block booking if we cannot resolve a valid numeric backend ID
    if (!Number.isFinite(doctorNumericId) || doctorNumericId <= 0) {
        toast.info('Please select a doctor loaded from backend to book.');
        return;
    }

    if (!slotTime) {
        toast.warning('Please select a time slot');
        return;
    }

    const dateObj = docSlots[slotIndex][0]?.datetime;
    if (!dateObj) {
        toast.error('Invalid date selection');
        return;
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`; 

    try {
        console.log("Sending booking request", {
            doctorId: doctorNumericId,
            date: formattedDate,
            time: slotTime
        });

        const { data } = await axios.post(
            `${backendUrl}/api/appointments/book`,
            {
                doctorId: doctorNumericId,
                date: formattedDate,
                time: slotTime
            },
            {
                headers: {
                    Authorization: `Bearer ${aToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Response:", data);
        toast.success("Appointment booked successfully!");
        getDoctosData();
        navigate("/patient-dashboard/appointments");

    } catch (error) {
        console.error("Appointment booking error:", error?.response || error);
        toast.error(error?.response?.data?.message || "Booking failed");
    }
}, [aToken, docSlots, slotIndex, backendUrl, docId, slotTime, navigate, getDoctosData, docInfo]);


    useEffect(() => {
        if (doctors.length > 0) {
            fetchDocInfo()
        }
    }, [fetchDocInfo, doctors])

    useEffect(() => {
        if (docInfo) {
            getAvailableSolts()
        }
    }, [docInfo, getAvailableSolts])

    return docInfo ? (
        <div>

            {/* ---------- Doctor Details ----------- */}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div>
                    <img className='bg-primary w-full sm:max-w-72 h-auto rounded-lg' src={docInfo.image} alt="" />
                </div>

                <div className='flex-1 border border-[#ADADAD] rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>

                    {/* ----- Doc Info : name, degree, experience ----- */}

                    <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" /></p>
                    <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <p>{docInfo.degree} - {docInfo.speciality}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
                    </div>

                    {/* ----- Doc About ----- */}
                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About <img className='w-3' src={assets.info_icon} alt="" /></p>
                        <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{docInfo.about}</p>
                    </div>

                    <p className='text-gray-600 font-medium mt-4'>Appointment fee: <span className='text-gray-800'>{currencySymbol}{docInfo.fees}</span> </p>
                </div>
            </div>

            {/* Booking slots */}
            <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]'>
                <h2 className='text-xl font-semibold mb-4 text-gray-800'>Select Appointment Date & Time</h2>
                
                {/* Date Selection - Calendar Style */}
                <div className='bg-white rounded-xl shadow-md p-4 mb-6'>
                    <p className='text-gray-700 font-medium mb-3'>Available Dates</p>
                    <div className='flex gap-3 items-center w-full overflow-x-auto pb-2 mt-2'>
                        {docSlots.length && docSlots.map((item, index) => {
                            const date = item[0] ? item[0].datetime : null;
                            if (!date) return null;
                            
                            const month = date.toLocaleString('default', { month: 'short' });
                            
                            return (
                                <div 
                                    onClick={() => setSlotIndex(index)} 
                                    key={index} 
                                    className={`text-center py-4 px-3 min-w-[72px] sm:min-w-[80px] rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                                        slotIndex === index 
                                            ? 'bg-primary text-white shadow-lg transform scale-105' 
                                            : 'border border-[#DDDDDD] hover:border-primary'
                                    }`}
                                >
                                    <p className='text-xs uppercase font-bold mb-1'>{daysOfWeek[date.getDay()]}</p>
                                    <p className='text-2xl font-bold'>{date.getDate()}</p>
                                    <p className='text-xs mt-1'>{month}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                {/* Time Slot Selection - Grid Layout */}
                <div className='bg-white rounded-xl shadow-md p-4 mb-6'>
                    <p className='text-gray-700 font-medium mb-3'>Available Time Slots</p>
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-2'>
                        {docSlots.length && docSlots[slotIndex].map((item, index) => (
                            <div 
                                onClick={() => setSlotTime(item.time)} 
                                key={index} 
                                className={`text-center py-3 px-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                    item.time === slotTime 
                                        ? 'bg-primary text-white shadow-md transform scale-105' 
                                        : 'text-gray-700 border border-[#DDDDDD] hover:border-primary hover:shadow-sm'
                                }`}
                            >
                                <div className='flex items-center justify-center'>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className='font-medium'>{item.time.toLowerCase()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Date & Time Summary */}
                {slotTime && (
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
                        <p className='text-blue-800 font-medium'>Your Selection:</p>
                        <div className='flex items-center mt-2 text-blue-700'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {docSlots[slotIndex][0] && (
                                <p className='font-medium'>
                                    {new Date(docSlots[slotIndex][0].datetime).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })} at {slotTime.toLowerCase()}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <button 
                    onClick={bookAppointment} 
                    className='bg-primary text-white font-medium px-8 py-3 rounded-lg my-4 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center'
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book Appointment
                </button>
            </div>

            {/* Listing Releated Doctors */}
            <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
        </div>
    ) : null
}

// PropTypes for RelatedDoctors component
RelatedDoctors.propTypes = {
    speciality: PropTypes.string.isRequired,
    docId: PropTypes.string.isRequired
}

export default Appointment
