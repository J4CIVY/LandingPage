import React from 'react';
import { FaUserCog, FaShieldAlt, FaMotorcycle } from 'react-icons/fa';

const AccountTab = ({ formData, handleInputChange, handleSavePersonalInfo }) => (
  <section aria-labelledby="mi-cuenta-title" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 bg-gray-50 rounded-lg p-6 shadow-sm">
      <h3 id="mi-cuenta-title" className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
        <FaUserCog className="text-slate-950 mr-3" aria-hidden="true" /> Información Personal
      </h3>
      <form className="space-y-6" onSubmit={e => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Nombre Completo', name: 'name', type: 'text' },
            { label: 'Correo', name: 'email', type: 'email' }
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <input
                id={name}
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-950 text-base"
                autoComplete="off"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Teléfono', name: 'phone' },
            { label: 'Contacto de Emergencia', name: 'emergencyContact' }
          ].map(({ label, name }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <input
                id={name}
                type="text"
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-950 text-base"
                autoComplete="off"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Moto', name: 'bikeModel' },
            { label: 'Año', name: 'bikeYear' }
          ].map(({ label, name }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <input
                id={name}
                type="text"
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-950 text-base"
                autoComplete="off"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Tipo de Sangre', name: 'bloodType' },
            { label: 'Alergias', name: 'allergies' }
          ].map(({ label, name }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <input
                id={name}
                type="text"
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-950 text-base"
                autoComplete="off"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSavePersonalInfo}
          className="bg-slate-950 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-red-600"
          aria-label="Guardar cambios en información personal"
        >
          Guardar Cambios
        </button>
      </form>
    </div>

    <aside className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FaShieldAlt className="text-slate-950 mr-3" aria-hidden="true" /> Seguridad
        </h3>
        <div className="space-y-4">
          <button className="w-full text-left bg-white hover:bg-gray-100 border border-gray-300 px-4 py-3 rounded-lg font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-950">
            Cambiar Contraseña
          </button>
          <button className="w-full text-left bg-white hover:bg-gray-100 border border-gray-300 px-4 py-3 rounded-lg font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-950">
            Autenticación en Dos Pasos
          </button>
          <button className="w-full text-left bg-white hover:bg-gray-100 border border-gray-300 px-4 py-3 rounded-lg font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-950">
            Dispositivos Conectados
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FaMotorcycle className="text-slate-950 mr-3" aria-hidden="true" /> Preferencias de Rodada
        </h3>
        <form className="space-y-6" onSubmit={e => e.preventDefault()}>
          <div>
            <label htmlFor="rideType" className="block text-sm font-medium text-gray-700 mb-2">Tipo de Rodada Preferida</label>
            <select
              id="rideType"
              name="rideType"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-950 text-base"
            >
              <option>Carretera</option>
              <option>Off-Road</option>
              <option>Urbana</option>
              <option>Todas</option>
            </select>
          </div>
          <div>
            <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-2">Nivel de Dificultad Preferido</label>
            <select
              id="difficultyLevel"
              name="difficultyLevel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-950 text-base"
            >
              <option>Principiante</option>
              <option>Intermedio</option>
              <option>Avanzado</option>
              <option>Extremo</option>
            </select>
          </div>
          <div>
            <label htmlFor="notificationFrequency" className="block text-sm font-medium text-gray-700 mb-2">Frecuencia de Notificaciones</label>
            <select
              id="notificationFrequency"
              name="notificationFrequency"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-950 text-base"
            >
              <option>Todas las notificaciones</option>
              <option>Solo eventos importantes</option>
              <option>Solo mis eventos registrados</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-slate-950 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-red-600"
            aria-label="Guardar preferencias de rodada"
          >
            Guardar Preferencias
          </button>
        </form>
      </div>
    </aside>
  </section>
);

export default AccountTab;