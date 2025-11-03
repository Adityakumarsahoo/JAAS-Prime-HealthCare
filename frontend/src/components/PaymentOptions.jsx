import React, { useState, useContext } from 'react';
import { X, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import UPIQrModal from './UPIQrModal';

const PaymentOptions = ({ appointment, onClose, onPaymentSelect }) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [showQr, setShowQr] = useState(false);
  const appCtx = useContext(AppContext);
  const currencySymbol = (appCtx?.currencySymbol) || '₹';

  const paymentMethods = [
    { id: 'netbanking', name: 'Net Banking', icon: <CreditCard className="w-6 h-6" />, description: 'Pay securely using your bank account' },
    { id: 'upi',        name: 'UPI',         icon: <Smartphone className="w-6 h-6" />, description: 'Pay using UPI apps like GPay, PhonePe, Paytm' },
    { id: 'cash',       name: 'Cash',        icon: <Banknote className="w-6 h-6" />, description: 'Pay cash at the clinic during appointment' },
  ];

  const amount = (() => {
    const fee = (appointment?.docData?.fees ?? appointment?.docData?.fee ?? appointment?.docData?.appointmentFee ?? appointment?.doctor?.fees ?? appointment?.doctor?.fee ?? appointment?.doctor?.appointmentFee);
    return (typeof fee === 'number' && fee > 0) ? fee : null;
  })();

  const proceed = () => {
    if (!selectedMethod) return;
    if (selectedMethod === 'upi') {
      setShowQr(true);
      return;
    }
    onPaymentSelect(appointment, selectedMethod);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Payment Options</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Appointment Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-800 mb-2">Appointment Details</h3>
          <p className="text-sm text-gray-600">Dr. {appointment.docData?.name || appointment.doctor?.name || appointment.doctor?.fullName || 'Doctor'}</p>
          <p className="text-sm text-gray-600">{appointment.slotDate || appointment.date} at {appointment.slotTime || appointment.time}</p>
          <p className="text-sm font-medium text-gray-800 mt-2">Fee: {amount != null ? `${currencySymbol}${amount}` : `${currencySymbol}N/A`}</p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-800 mb-3">Select Payment Method</h3>
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 ${selectedMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${selectedMethod === method.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>{method.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={proceed} disabled={!selectedMethod} className={`flex-1 px-4 py-2 rounded-lg transition-colors ${selectedMethod ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
            {selectedMethod === 'upi' ? 'Show QR' : 'Proceed to Pay'}
          </button>
        </div>
      </div>

      {showQr && (
        <UPIQrModal appointment={appointment} onClose={() => setShowQr(false)} onPaid={() => onPaymentSelect(appointment, 'upi')} />
      )}
    </div>
  );
};

export default PaymentOptions;

