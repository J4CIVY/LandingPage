import React, { useContext } from 'react';
import AuthContext from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../auth/api';

const PaymentButton = ({ amount, description, items }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      const customer = {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        billing_address: {
          street1: user.address || '',
          city: user.city || '',
          country_code: 'CO'
        }
      };

      const response = await api.post('/payments/create-payment-intent', {
        amount,
        description,
        reference_id: `ORD-${Date.now()}`,
        customer,
        metadata: items.map(item => ({
          key: item.id,
          value: item.name
        }))
      });

      // Redirigir al checkout de Bold o mostrar formulario de pago
      if (response.data.data.next_action) {
        window.location.href = response.data.data.next_action.redirect_url;
      } else {
        navigate('/payment-confirmation', { state: { paymentData: response.data.data } });
      }
    } catch (error) {
      console.error('Error al crear pago:', error);
      alert('Ocurrió un error al procesar el pago');
    }
  };

  return (
    <button 
      onClick={handlePayment}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
    >
      Pagar ahora
    </button>
  );
};

export default PaymentButton;