import { toast } from 'react-toastify';

// Helper: extract fee from appointment structure
const getAppointmentFee = (appointment) => {
  const fee = (
    appointment?.docData?.fees ??
    appointment?.docData?.fee ??
    appointment?.docData?.appointmentFee ??
    appointment?.doctor?.fees ??
    appointment?.doctor?.fee ??
    appointment?.doctor?.appointmentFee
  );
  const num = typeof fee === 'number' ? fee : Number(fee);
  return Number.isFinite(num) && num > 0 ? num : 0;
};

// Helper: safe open in same tab (deep links), or new tab for web URLs
const navigateTo = (url, { newTab = false } = {}) => {
  try {
    if (newTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  } catch (e) {
    console.error('Navigation error:', e);
  }
};

// Payment processing with real redirects
export const processPayment = async (appointment, paymentMethod) => {
  try {
    console.log('Processing payment:', { appointment: appointment.id, method: paymentMethod });
 
    switch (paymentMethod) {
      case 'cash':
        return processCashPayment(appointment);
      case 'upi':
        return processUPIPayment(appointment);
      case 'netbanking':
        return processNetBankingPayment(appointment);
      default:
        throw new Error('Invalid payment method');
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
};

const processCashPayment = async (appointment) => {
  // For cash payment, we just mark it as selected
  // In a real app, you might update the appointment status to indicate cash payment selected
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Cash payment selected. Please pay at the clinic during your appointment.',
        paymentMethod: 'cash',
        appointmentId: appointment.id
      });
    }, 500);
  });
};

const processUPIPayment = async (appointment) => {
  // Build UPI deep link that opens installed apps (PhonePe, Google Pay, etc.)
  const amount = getAppointmentFee(appointment);
  if (!amount) {
    throw new Error('No fee amount available for UPI payment.');
  }

  const vpa = import.meta.env.VITE_UPI_VPA || 'primehealthcare@icici';
  const payeeName = import.meta.env.VITE_MERCHANT_NAME || 'Prime HealthCare';
  const note = `Appointment ${appointment?.id} on ${appointment?.slotDate || appointment?.date} at ${appointment?.slotTime || appointment?.time}`;
  const orderId = `APPT-${appointment?.id}-${Date.now()}`;

  // Universal UPI deep link (lets user pick app)
  const upiUniversal = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(orderId)}`;
  // App-specific (optional): PhonePe and Google Pay
  const phonePe = `phonepe://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(orderId)}`;
  const gPay = `tez://upi/pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(orderId)}`;

  // Prefer universal link to show chooser; some devices benefit from explicit app links.
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobile) {
    toast.info('UPI works best on mobile. Please open this page on your phone.');
  }

  // Try universal first
  navigateTo(upiUniversal, { newTab: false });

  // Return immediately indicating redirection initiated
  return {
    success: true,
    message: 'UPI payment initiated. Complete the payment in your UPI app.',
    paymentMethod: 'upi',
    appointmentId: appointment.id,
    redirect: upiUniversal,
    alternatives: { phonePe, gPay }
  };
};

const processNetBankingPayment = async (appointment) => {
  // Redirect to a configurable NetBanking portal (placeholder)
  const netBankingUrl = import.meta.env.VITE_NETBANKING_URL || 'https://www.onlinesbi.sbi/';
  navigateTo(netBankingUrl, { newTab: true });

  return {
    success: true,
    message: 'Net banking opened in a new tab. Complete payment there.',
    paymentMethod: 'netbanking',
    appointmentId: appointment.id,
    redirect: netBankingUrl
  };
};

// Function to show payment processing UI
export const showPaymentProcessing = (paymentMethod) => {
  const messages = {
    cash: 'Processing cash payment selection...',
    upi: 'Redirecting to UPI payment...',
    netbanking: 'Redirecting to net banking...'
  };
  
  toast.info(messages[paymentMethod] || 'Processing payment...');
};

// Function to handle payment success
export const handlePaymentSuccess = (result) => {
  toast.success(result.message);
  
  // In a real app, you might want to:
  // 1. Update the appointment status in the backend
  // 2. Refresh the appointments list
  // 3. Send confirmation email/SMS
  // 4. Update local state
  
  console.log('Payment successful:', result);
};

// Function to handle payment failure
export const handlePaymentFailure = (error) => {
  toast.error(error.message || 'Payment failed. Please try again.');
  console.error('Payment failed:', error);
};
