import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../components/auth/api';

const PaymentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        if (location.state?.paymentData) {
          const referenceId = location.state.paymentData.reference_id;
          const response = await api.get(`/payments/check-payment/${referenceId}`);
          
          setPaymentData(response.data.data);
          setPaymentStatus(response.data.data.status.toLowerCase());
        }
      } catch (error) {
        console.error('Error al verificar pago:', error);
        setPaymentStatus('error');
      }
    };

    checkPaymentStatus();
  }, [location.state]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      {paymentStatus === 'approved' && (
        <div className="text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">¡Pago exitoso!</h2>
          <p className="mb-4">Tu pago ha sido procesado correctamente.</p>
          <p className="font-semibold">Referencia: {paymentData?.reference_id}</p>
          <p className="font-semibold">Monto: ${paymentData?.amount?.total_amount?.toLocaleString()}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver al inicio
          </button>
        </div>
      )}

      {paymentStatus === 'rejected' && (
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">✗</div>
          <h2 className="text-2xl font-bold mb-2">Pago rechazado</h2>
          <p className="mb-4">Lo sentimos, tu pago no pudo ser procesado.</p>
          <button 
            onClick={() => navigate('/checkout')}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {paymentStatus === 'processing' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Procesando pago...</h2>
          <p>Estamos verificando el estado de tu transacción.</p>
        </div>
      )}

      {paymentStatus === 'error' && (
        <div className="text-center">
          <div className="text-yellow-500 text-5xl mb-4">!</div>
          <h2 className="text-2xl font-bold mb-2">Error al verificar pago</h2>
          <p className="mb-4">Por favor verifica más tarde o contacta a soporte.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver al inicio
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentConfirmation;