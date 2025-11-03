import React, { useContext, useMemo } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import qrCode from '../assets/Qr_Code.png';

const UPIQrModal = ({ appointment, onClose, onPaid }) => {
  const appCtx = useContext(AppContext);
  const currencySymbol = (appCtx?.currencySymbol) || '₹';

  const doctorName = appointment?.docData?.name || appointment?.doctor?.fullName || appointment?.doctor?.name || 'Doctor';
  const date = appointment?.slotDate || appointment?.date || '';
  const time = appointment?.slotTime || appointment?.time || '';
  const amount = useMemo(() => {
    const fee = (appointment?.docData?.fees ?? appointment?.docData?.fee ?? appointment?.docData?.appointmentFee ?? appointment?.doctor?.fees ?? appointment?.doctor?.fee ?? appointment?.doctor?.appointmentFee);
    return (typeof fee === 'number' && fee > 0) ? fee : 0;
  }, [appointment]);

  const vpa = import.meta.env.VITE_UPI_VPA || 'demo@upi';
  const merchantName = import.meta.env.VITE_MERCHANT_NAME || 'Prime HealthCare';
  const note = `Appointment with ${doctorName} on ${date} ${time}`;
  const upiIntent = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

  const qrSrc = import.meta.env.VITE_UPI_QR_URL || qrCode;

    const openUpiApp = () => {
    window.location.href = upiIntent;
    // Optional: automatically mark as success after a short delay for demo
    setTimeout(() => { if (onPaid) onPaid(); }, 8000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">Scan QR to Pay via UPI</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-center">
            <img src={qrSrc} alt="UPI QR" className="mx-auto w-64 h-64 object-contain border rounded" />
            <p className="mt-3 text-sm text-gray-600">Doctor: <span className="font-medium text-gray-800">{doctorName}</span></p>
            <p className="text-sm text-gray-600">Appointment: <span className="font-medium text-gray-800">{date} {time}</span></p>
            <p className="text-sm font-medium text-gray-800 mt-1">Amount: {currencySymbol}{amount}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={openUpiApp} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700">
              <ExternalLink className="w-4 h-4" /> Open UPI App
            </button>
            <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Close</button>
          </div>
          <p className="text-xs text-gray-500">Tip: If QR doesnt open your app, tap "Open UPI App".</p>
        </div>
      </div>
    </div>
  );
};

export default UPIQrModal;


