import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Layout from '../components/shared/Layout';
import ShippingForm from '../components/checkout/ShippingForm';
import PaymentForm from '../components/checkout/PaymentForm';
import ReviewOrder from '../components/checkout/ReviewOrder';
import axios from 'axios';

// Configuración de la API
const BOLD_API_URL = 'https://api.online.payments.bold.co/v1';
const BOLD_API_KEY = 'tu-api-key-aqui'; // Debería estar en variables de entorno

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
    postalCode: '110111'
  });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
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
    setPaymentError(null);
    
    try {
      const referenceId = `ORD-${Date.now()}`;
      const customer = {
        name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        billing_address: {
          street1: shippingInfo.address,
          city: shippingInfo.city,
          country_code: shippingInfo.country,
          postal_code: shippingInfo.postalCode
        },
        shipping_address: {
          street1: shippingInfo.address,
          city: shippingInfo.city,
          country_code: shippingInfo.country,
          postal_code: shippingInfo.postalCode
        }
      };

      // Crear la intención de pago
      const paymentIntent = {
        reference_id: referenceId,
        amount: {
          currency: "COP",
          total_amount: subtotal * 100, // La API espera el valor en centavos
          tip_amount: 0,
          taxes: [] // Agregar impuestos si es necesario
        },
        description: `Compra en BSK MT - ${cartItems.length} productos`,
        callback_url: `${window.location.origin}/payment-confirmation`, // URL para redirección
        customer: customer,
        metadata: {
          cart_items: JSON.stringify(cartItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity
          })))
        }
      };

      const response = await axios.post(
        `${BOLD_API_URL}/payment-intent`,
        paymentIntent,
        {
          headers: {
            'Authorization': `x-api-key ${BOLD_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Si es tarjeta de crédito, procesar directamente
      if (paymentMethod === 'credit_card') {
        const paymentAttempt = {
          reference_id: referenceId,
          payer: {
            person_type: "NATURAL_PERSON",
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            document_type: "CEDULA",
            document_number: "1234567890", // Deberías recolectar este dato
            billing_address: customer.billing_address
          },
          payment_method: {
            name: "CREDIT_CARD",
            // Estos datos deberían venir del formulario de pago
            card_number: "4111111111111111",
            cardholder_name: customer.name,
            expiration_month: "12",
            expiration_year: "2030",
            installments: 1,
            cvc: "123"
          }
        };

        const paymentResponse = await axios.post(
          `${BOLD_API_URL}/payment`,
          paymentAttempt,
          {
            headers: {
              'Authorization': `x-api-key ${BOLD_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (paymentResponse.data.next_action) {
          // Redireccionar si es necesario (para 3DSecure, etc.)
          window.location.href = paymentResponse.data.next_action.redirect_url;
          return;
        }
      }

      // Redireccionar a confirmación de pago
      navigate('/payment-confirmation', {
        state: { 
          paymentData: {
            reference_id: referenceId,
            transaction_id: response.data.transaction_id,
            amount: subtotal,
            customer,
            paymentMethod,
            status: 'PENDING'
          }
        }
      });
      
      // Limpiar carrito después de una compra exitosa
      clearCart();
    } catch (error) {
      console.error('Error processing payment:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Ocurrió un error al procesar el pago';
      setPaymentError(errorMessage);
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
            {paymentError && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                {paymentError}
              </div>
            )}
            
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