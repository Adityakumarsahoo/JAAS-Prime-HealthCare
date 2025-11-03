import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { assets } from '../assets/assets'
import { getMyAppointments, cancelAppointment as cancelAppointmentApi } from "../services/UserService";
import PaymentOptions from '../components/PaymentOptions';
import { processPayment, showPaymentProcessing, handlePaymentSuccess, handlePaymentFailure } from '../services/PaymentService'

const MyAppointments = () => {

    const appCtx = useContext(AppContext)
    const aToken = appCtx?.aToken
    const currencySymbol = (appCtx?.currencySymbol) || '₹'
    const navigate = useNavigate()

    const [appointments, setAppointments] = useState([])
    const [payment, setPayment] = useState('')

    // Payment modal state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Format date supporting both legacy "20_01_2000" and ISO "yyyy-MM-dd"
    const formatDate = useCallback((raw) => {
        if (!raw) return ''
        if (raw.includes('_')) {
            const [d, m, y] = raw.split('_')
            return `${d} ${months[Number(m)]} ${y}`
        }
        const [y, m, d] = raw.split('-')
        return `${d} ${months[Number(m) - 1]} ${y}`
    }, [months])

    // Getting User Appointments Data Using API
    const getUserAppointments = useCallback(async () => {
        try {
            const { data } = await getMyAppointments();
            if (Array.isArray(data)) {
                setAppointments(data.slice().reverse());
            } else if (Array.isArray(data.appointments)) {
                setAppointments(data.appointments.slice().reverse());
            } else {
                setAppointments([]);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }, [])

    // Function to cancel appointment Using API
    const cancelAppointment = useCallback(async (appointmentId) => {
        try {
            const { data } = await cancelAppointmentApi(appointmentId);
            if (data?.success) {
                toast.success(data.message);
                getUserAppointments();
            } else {
                toast.error(data?.message || "Failed to cancel appointment");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }, [getUserAppointments])

    // Legacy payment code removed; backend does not provide payment APIs yet
    const initPay = useCallback(() => {}, []);

    // Function to make payment using razorpay
    const appointmentRazorpay = useCallback(async () => {}, [])

    // Function to make payment using stripe
    const appointmentStripe = useCallback(async () => {}, [])

    // Handle payment option click
    const handlePaymentClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowPaymentModal(true);
    };

    // Handle payment method selection
    const handlePaymentSelect = async (appointment, paymentMethod) => {
  setShowPaymentModal(false);
  try {
    showPaymentProcessing(paymentMethod);
    const result = await processPayment(selectedAppointment, paymentMethod);
    handlePaymentSuccess(result);

    if (["cash", "upi", "netbanking"].includes(paymentMethod)) {
      setAppointments(prev => prev.map(a => ((a.id === (appointment.id || appointment._id)) ? { ...a, status: "APPROVED" } : a)));
    }
    // Optionally refresh appointments
    // getUserAppointments();
  } catch (error) {
    handlePaymentFailure(error);
  }
};



        useEffect(() => {
        if (!aToken) return;
        // Initial load
        getUserAppointments();

        // Real-time polling every 5 seconds
        const interval = setInterval(() => {
            getUserAppointments();
        }, 5000);

        // Refresh on tab focus for responsiveness
        const onFocus = () => getUserAppointments();
        window.addEventListener('focus', onFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', onFocus);
        };
    }, [aToken, getUserAppointments])

    if (!aToken) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="bg-white rounded-xl shadow-md p-6 text-gray-700">
                    Please log in to view your appointments.
                </div>
            </div>
        );
    }

    return (
        <div>
            <p className='pb-3 mt-12 text-lg font-medium text-gray-600 border-b'>My appointments</p>
            <div className=''>
                {appointments.map((item, index) => (
                    <div key={index} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'>
                        <div>
                            <img className='w-24 sm:w-36 md:w-48 bg-[#EAEFFF] h-auto' src={(item.docData?.image) || (item.doctor?.image) || ''} alt="" />
                        </div>
                        <div className='flex-1 text-sm text-[#5E5E5E]'>
                            <p className='text-[#262626] text-base font-semibold'>{item.docData?.name || item.doctor?.name || 'Doctor'}</p>
                            <p>{item.docData?.speciality || item.doctor?.speciality || ''}</p>
                            <p className='text-[#464646] font-medium mt-1'>Address:</p>
                            <p className=''>{item.docData?.address?.line1 || item.doctor?.address?.line1 || ''}</p>
                            <p className=''>{item.docData?.address?.line2 || item.doctor?.address?.line2 || ''}</p>
                            <p className=' mt-1'><span className='text-sm text-[#3C3C3C] font-medium'>Date & Time:</span> {formatDate(item.slotDate || item.date)} |  {item.slotTime || item.time}</p>
                            {(() => {
                                const fee = (item.docData?.fees ?? item.docData?.fee ?? item.docData?.appointmentFee ?? item.doctor?.fees ?? item.doctor?.fee ?? item.doctor?.appointmentFee);
                                return (typeof fee === 'number' && fee > 0) ? (
                                    <p className=' mt-1'><span className='text-sm text-[#3C3C3C] font-medium'>Doctor fee:</span> {currencySymbol}{fee}</p>
                                ) : null
                            })()}
                        </div>
                        <div></div>
                        <div className='flex flex-col gap-2 justify-end text-sm text-center'>
                            {item.status === 'PENDING' && <button onClick={() => handlePaymentClick(item)} className='sm:min-w-48 py-2 border rounded text-[#696969] bg-[#EAEFFF] hover:bg-[#D4E6FF] transition-colors cursor-pointer'>Pending for payment</button>}
                            {item.status === 'CONFIRMED' && <button className='sm:min-w-48 py-2 border rounded text-[#696969]  bg-[#EAEFFF]'>Confirmed</button>}
                            {item.status === 'CANCELLED' && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>}

                            {(item.status === 'PENDING' || item.status === 'CONFIRMED' || item.status === 'APPROVED') && <button onClick={() => cancelAppointment(item.id || item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appointment</button>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Options Modal */}
            {showPaymentModal && selectedAppointment && (
                <PaymentOptions
                    appointment={selectedAppointment}
                    onClose={() => setShowPaymentModal(false)}
                    onPaymentSelect={handlePaymentSelect}
                />
            )}
        </div>
    )
}

export default MyAppointments



