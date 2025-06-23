import React from 'react';
import { useCart } from '../../../context/CartContext';

const ReviewOrder = ({ shippingInfo, paymentMethod, cartItems, subtotal, onSubmit, onBack }) => {
  const shipping = subtotal > 100000 ? 0 : 10000;
  const total = subtotal + shipping;

  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case 'credit_card':
        return 'Tarjeta de crédito/débito';
      case 'pse':
        return 'PSE (Pagos Seguros en Línea)';
      case 'cash':
        return 'Efectivo';
      default:
        return paymentMethod;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Revisar tu pedido</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-bold mb-3">Información de envío</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
            <p>{shippingInfo.address}</p>
            <p>{shippingInfo.city}, {shippingInfo.country}</p>
            <p>Teléfono: {shippingInfo.phone}</p>
            <p>Email: {shippingInfo.email}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-3">Método de pago</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p>{getPaymentMethodName()}</p>
            {paymentMethod === 'credit_card' && (
              <p className="mt-2">Tarjeta terminada en **** 3456</p>
            )}
          </div>
        </div>
      </div>
      
      <h3 className="font-bold mb-3">Resumen del pedido</h3>
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        {cartItems.map(item => (
          <div key={item.id} className="flex justify-between py-2 border-b">
            <div>
              <p>{item.name}</p>
              <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
            </div>
            <p>${(item.price * item.quantity).toLocaleString()}</p>
          </div>
        ))}
        
        <div className="pt-4">
          <div className="flex justify-between py-2">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Envío</span>
            <span>{shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-lg">
            <span>Total</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 py-2 px-6 rounded-lg font-medium"
        >
          Volver
        </button>
        <button
          onClick={onSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium"
        >
          Confirmar y pagar
        </button>
      </div>
    </div>
  );
};

export default ReviewOrder;