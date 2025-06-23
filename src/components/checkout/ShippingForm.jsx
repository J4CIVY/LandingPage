import React from 'react';
import { useForm } from 'react-hook-form';

const ShippingForm = ({ initialValues, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialValues
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-xl font-bold mb-6">Información de envío</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1">Nombre</label>
          <input
            {...register('firstName', { required: 'Este campo es requerido' })}
            className="w-full border rounded py-2 px-3"
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
        </div>
        
        <div>
          <label className="block mb-1">Apellido</label>
          <input
            {...register('lastName', { required: 'Este campo es requerido' })}
            className="w-full border rounded py-2 px-3"
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block mb-1">Dirección</label>
        <input
          {...register('address', { required: 'Este campo es requerido' })}
          className="w-full border rounded py-2 px-3"
        />
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1">Ciudad</label>
          <input
            {...register('city', { required: 'Este campo es requerido' })}
            className="w-full border rounded py-2 px-3"
          />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
        </div>
        
        <div>
          <label className="block mb-1">País</label>
          <select
            {...register('country')}
            className="w-full border rounded py-2 px-3"
          >
            <option value="CO">Colombia</option>
            <option value="US">Estados Unidos</option>
            {/* Más países... */}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-1">Teléfono</label>
          <input
            {...register('phone', { 
              required: 'Este campo es requerido',
              pattern: {
                value: /^[0-9]{10}$/,
                message: 'Teléfono inválido'
              }
            })}
            className="w-full border rounded py-2 px-3"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>
        
        <div>
          <label className="block mb-1">Correo electrónico</label>
          <input
            {...register('email', { 
              required: 'Este campo es requerido',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Correo inválido'
              }
            })}
            className="w-full border rounded py-2 px-3"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium"
        >
          Continuar al pago
        </button>
      </div>
    </form>
  );
};

export default ShippingForm;