import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../auth/api';

const PaymentButton = ({ amount, description, items, customer, referenceId }) => {
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      const response = await api.post('/payments/create-payment-intent', {
        amount,
        description,
        reference_id: referenceId,
        customer,
        metadata: items.map(item => ({
          key: item.id,
          value: item.name
        }))
      });

      // Si hay una URL de redirección (para PSE u otros métodos)
      if (response.data.data.next_action) {
        window.location.href = response.data.data.next_action.redirect_url;
      } else {
        // Para tarjetas de crédito, podrías mostrar un formulario aquí
        // O redirigir a una página de confirmación
        navigate('/payment-confirmation', { 
          state: { 
            paymentData: response.data.data 
          } 
        });
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert('Ocurrió un error al procesar el pago');
    }
  };

  return (
    <button 
      onClick={handlePayment}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium"
    >
      Confirmar y pagar
    </button>
  );
};

export default PaymentButton;