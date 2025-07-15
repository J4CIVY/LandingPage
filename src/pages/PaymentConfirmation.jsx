import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../components/auth/api';

const PaymentConfirmation = () => {
  const { clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [paymentData, setPaymentData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        if (!location.state?.paymentData?.reference_id) {
          setPaymentStatus('not_found');
          return;
        }

        const referenceId = location.state.paymentData.reference_id;
        const response = await api.get(`/payments/check-payment/${referenceId}`);

        if (response.data.data.status === 'PAID' || 
            response.data.data.status === 'APPROVED') {
          setPaymentStatus('approved');
          setPaymentData(response.data.data);
          clearCart();
        } else if (response.data.data.status === 'REJECTED' || 
                 response.data.data.status === 'FAILED') {
          setPaymentStatus('rejected');
          setPaymentData(response.data.data);
        } else if (retryCount < maxRetries) {
          // Reintentar después de 3 segundos
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            checkPaymentStatus();
          }, 3000);
        } else {
          setPaymentStatus('timeout');
        }
      } catch (error) {
        console.error('Error checking payment:', error);
        
        if (error.response?.status === 404 && retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            checkPaymentStatus();
          }, 3000);
        } else {
          setPaymentStatus('not_found');
        }
      }
    };

    checkPaymentStatus();

    return () => {
      // Limpieza si el componente se desmonta
    };
  }, [location.state, clearCart, retryCount]);

  const handleRetry = () => {
    setRetryCount(0);
    setPaymentStatus('processing');
  };

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          {paymentStatus === 'approved' && (
            <div className="text-center">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-bold mb-2">¡Pago exitoso!</h2>
              <p className="mb-4">Tu pedido ha sido procesado correctamente.</p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <h3 className="font-bold mb-2">Detalles del pedido:</h3>
                <p><span className="font-semibold">Referencia:</span> {paymentData?.reference_id}</p>
                <p><span className="font-semibold">Monto:</span> ${paymentData?.amount?.total_amount?.toLocaleString()}</p>
                <p><span className="font-semibold">Fecha:</span> {new Date().toLocaleString()}</p>
              </div>
              
              <p className="mb-6">Hemos enviado un correo con los detalles de tu compra.</p>
              
              <button 
                onClick={() => navigate('/')}
                className="bg-[#000031] hover:bg-[#00FF99] text-white py-2 px-6 rounded"
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
              
              {paymentData?.errors && (
                <div className="bg-red-50 p-3 rounded-lg mb-4 text-left text-sm">
                  <p className="font-semibold">Razón:</p>
                  <p>{paymentData.errors[0]?.message || 'Error desconocido'}</p>
                </div>
              )}
              
              <button 
                onClick={() => navigate('/checkout')}
                className="bg-gray-200 hover:bg-gray-300 py-2 px-6 rounded mr-3"
              >
                Intentar nuevamente
              </button>
              <button 
                onClick={() => navigate('/')}
                className="bg-[#000031] hover:bg-[#00FF99] text-white py-2 px-6 rounded"
              >
                Volver al inicio
              </button>
            </div>
          )}

          {paymentStatus === 'processing' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Verificando pago...</h2>
              <p>Estamos confirmando el estado de tu transacción.</p>
              <p className="text-sm text-gray-500 mt-4">
                Intento {retryCount + 1} de {maxRetries}
              </p>
            </div>
          )}

          {paymentStatus === 'timeout' && (
            <div className="text-center">
              <div className="text-orange-500 text-5xl mb-4">!</div>
              <h2 className="text-2xl font-bold mb-2">Tiempo de espera agotado</h2>
              <p className="mb-4">
                La verificación del pago está tomando más tiempo de lo normal.<br />
                Por favor verifica más tarde o contacta a soporte.
              </p>
              <button
                onClick={handleRetry}
                className="bg-[#000031] hover:bg-[#00FF99] text-white py-2 px-6 rounded mr-3"
              >
                Reintentar verificación
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-200 hover:bg-gray-300 py-2 px-6 rounded"
              >
                Volver al inicio
              </button>
            </div>
          )}

          {paymentStatus === 'not_found' && (
            <div className="text-center">
              <div className="text-yellow-500 text-5xl mb-4">?</div>
              <h2 className="text-2xl font-bold mb-2">Transacción no encontrada</h2>
              <p className="mb-4">No pudimos encontrar información sobre tu pago.</p>
              
              <div className="bg-yellow-50 p-3 rounded-lg mb-6">
                <p>Por favor verifica si el pago se completó o contacta a soporte con tu referencia.</p>
                <p className="mt-2 font-semibold">Referencia: {location.state?.paymentData?.reference_id}</p>
              </div>
              
              <button 
                onClick={() => navigate('/')}
                className="bg-[#000031] hover:bg-[#00FF99] text-white py-2 px-6 rounded mr-3"
              >
                Volver al inicio
              </button>
              <button 
                onClick={() => navigate('/checkout')}
                className="bg-gray-200 hover:bg-gray-300 py-2 px-6 rounded"
              >
                Intentar nuevamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;