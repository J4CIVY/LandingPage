import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Layout from '../components/shared/Layout';
import ShippingForm from '../components/checkout/ShippingForm';
import PaymentForm from '../components/checkout/PaymentForm';
import ReviewOrder from '../components/checkout/ReviewOrder';
import axios from 'axios';

const Checkout = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    country: 'CO',
    phone: '',
    email: '',
    postalCode: '110111' // Agregado el campo postalCode
  });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleShippingSubmit = (data) => {
    setShippingInfo(data);
    setStep(2);
  };

  const handlePaymentSubmit = (method) => {
    setPaymentMethod(method);
    setStep(3);
  };

  const handleOrderSubmit = async () => {
    setIsSubmitting(true);
    try {
      const customer = {
        name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        billing_address: {
          street1: shippingInfo.address,
          city: shippingInfo.city,
          country_code: shippingInfo.country,
          postal_code: shippingInfo.postalCode
        }
      };

      const response = await axios.post('/payments/create-payment-intent', {
        amount: subtotal,
        description: `Compra en BSK MT - ${cartItems.length} productos`,
        customer: shippingInfo,
        reference_id: `ORD-${Date.now()}`
      });

      navigate('/payment-confirmation', {
        state: { 
          paymentData: {
            reference_id: response.data.data.reference_id,
            amount: subtotal,
            customer,
            paymentMethod
          }
        }
      });
      
      // Limpiar carrito después de una compra exitosa
      clearCart();
    } catch (error) {
      console.error('Error creating payment:', error);
      alert(`Error al procesar el pago: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          {/* Pasos del checkout */}
          <div className="flex justify-between mb-8">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="mt-2">Envío</span>
            </div>
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="mt-2">Pago</span>
            </div>
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="mt-2">Revisión</span>
            </div>
          </div>
          
          {/* Contenido del paso actual */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {step === 1 && (
              <ShippingForm 
                initialValues={shippingInfo}
                onSubmit={handleShippingSubmit} 
              />
            )}
            
            {step === 2 && (
              <PaymentForm 
                initialMethod={paymentMethod}
                onSubmit={handlePaymentSubmit}
                onBack={() => setStep(1)}
              />
            )}
            
            {step === 3 && (
              <ReviewOrder 
                shippingInfo={shippingInfo}
                paymentMethod={paymentMethod}
                cartItems={cartItems}
                subtotal={subtotal}
                onSubmit={handleOrderSubmit}
                onBack={() => setStep(2)}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;