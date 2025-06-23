import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../components/auth/api';
import { useCart } from '../../context/CartContext';

const PaymentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        if (location.state?.paymentData) {
          const referenceId = location.state.paymentData.reference_id;
          const response = await api.get(`/payments/check-payment/${referenceId}`);
          
          setPaymentData(response.data.data);
          
          if (response.data.data.status === 'APPROVED') {
            setPaymentStatus('approved');
            clearCart();
          } else if (response.data.data.status === 'REJECTED') {
            setPaymentStatus('rejected');
          } else {
            // Si sigue procesando, verificar de nuevo después de un tiempo
            setTimeout(checkPaymentStatus, 3000);
          }
        }
      } catch (error) {
        console.error('Error al verificar pago:', error);
        setPaymentStatus('error');
      }
    };

    checkPaymentStatus();
  }, [location.state, clearCart]);

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
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded mr-3"
              >
                Intentar nuevamente
              </button>
              <button 
                onClick={() => navigate('/')}
                className="bg-gray-200 hover:bg-gray-300 font-bold py-2 px-6 rounded"
              >
                Volver al inicio
              </button>
            </div>
          )}

          {paymentStatus === 'processing' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Procesando pago...</h2>
              <p>Estamos verificando el estado de tu transacción.</p>
              <p className="text-sm text-gray-600 mt-4">Por favor no cierres esta página.</p>
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="text-center">
              <div className="text-yellow-500 text-5xl mb-4">!</div>
              <h2 className="text-2xl font-bold mb-2">Error al verificar pago</h2>
              <p className="mb-4">No pudimos confirmar el estado de tu pago.</p>
              
              <div className="bg-yellow-50 p-3 rounded-lg mb-6">
                <p>Por favor verifica tu correo electrónico o contacta a soporte para confirmar el estado de tu pedido.</p>
                <p className="mt-2 font-semibold">Referencia: {paymentData?.reference_id}</p>
              </div>
              
              <button 
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
              >
                Volver al inicio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;