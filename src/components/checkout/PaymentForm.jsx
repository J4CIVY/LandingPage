import React, { useState } from 'react';

const PaymentForm = ({ initialMethod, onSubmit, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState(initialMethod);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(paymentMethod);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-6">Método de pago</h2>
      
      <div className="space-y-4 mb-6">
        <div 
          className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50' : ''}`}
          onClick={() => setPaymentMethod('credit_card')}
        >
          <div className="flex items-center">
            <input
              type="radio"
              checked={paymentMethod === 'credit_card'}
              onChange={() => {}}
              className="mr-3"
            />
            <div>
              <h3 className="font-medium">Tarjeta de crédito/débito</h3>
              <p className="text-sm text-gray-600">Paga con Visa, Mastercard, American Express</p>
            </div>
          </div>
          
          {paymentMethod === 'credit_card' && (
            <div className="mt-4 pl-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1">Número de tarjeta</label>
                  <input
                    placeholder="1234 5678 9012 3456"
                    className="w-full border rounded py-2 px-3"
                  />
                </div>
                
                <div>
                  <label className="block mb-1">Nombre en la tarjeta</label>
                  <input
                    placeholder="Nombre Apellido"
                    className="w-full border rounded py-2 px-3"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Mes</label>
                  <select className="w-full border rounded py-2 px-3">
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1">Año</label>
                  <select className="w-full border rounded py-2 px-3">
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i} value={new Date().getFullYear() + i}>
                        {new Date().getFullYear() + i}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1">CVV</label>
                  <input
                    placeholder="123"
                    className="w-full border rounded py-2 px-3"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div 
          className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'pse' ? 'border-blue-500 bg-blue-50' : ''}`}
          onClick={() => setPaymentMethod('pse')}
        >
          <div className="flex items-center">
            <input
              type="radio"
              checked={paymentMethod === 'pse'}
              onChange={() => {}}
              className="mr-3"
            />
            <div>
              <h3 className="font-medium">PSE (Pagos Seguros en Línea)</h3>
              <p className="text-sm text-gray-600">Paga directamente desde tu cuenta bancaria</p>
            </div>
          </div>
        </div>
        
        <div 
          className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : ''}`}
          onClick={() => setPaymentMethod('cash')}
        >
          <div className="flex items-center">
            <input
              type="radio"
              checked={paymentMethod === 'cash'}
              onChange={() => {}}
              className="mr-3"
            />
            <div>
              <h3 className="font-medium">Efectivo</h3>
              <p className="text-sm text-gray-600">Paga en efectivo en puntos autorizados</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 py-2 px-6 rounded-lg font-medium"
        >
          Volver
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium"
        >
          Revisar pedido
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;