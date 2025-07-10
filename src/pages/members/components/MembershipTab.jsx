import React from 'react';
import { FaMedal, FaStar } from 'react-icons/fa';

const MembershipTab = ({ userData, handleMembershipAction }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de tu Membresía</h3>
        <div className="border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-2xl font-bold text-slate-950 mb-2 flex items-center justify-center">
            <FaMedal className="mr-2" /> {userData.membership}
          </div>
          <div className="text-gray-600 mb-4">
            Válida hasta: {userData.membershipExpiry}
          </div>
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-slate-950 to-green-500 h-2.5 rounded-full"
                style={{ width: '75%' }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 mt-1">75% completado hacia el próximo nivel</div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleMembershipAction('renew')}
              className="bg-slate-950 hover:bg-green-500 text-white px-4 py-2 rounded-md transition"
            >
              Renovar Membresía
            </button>
            <button
              onClick={() => handleMembershipAction('upgrade')}
              className="bg-white hover:bg-slate-50 border border-slate-500 px-4 py-2 rounded-md transition"
            >
              Mejorar Nivel
            </button>
            <button
              onClick={() => handleMembershipAction('cancel')}
              className="bg-white hover:bg-red-50 border border-red-500 text-red-500 px-4 py-2 rounded-md transition"
            >
              Cancelar Membresía
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Beneficios de tu Membresía {userData.membership}
        </h3>
        <ul className="space-y-2">
          {userData.membershipBenefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <FaStar className="text-slate-950 mr-2 mt-1 flex-shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div>
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Comparativa de Niveles de Membresía</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Beneficio</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bronce</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Plata</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Oro</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Platino</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Descuento en talleres</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">5%</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">10%</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">20%</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">30%</td>
              </tr>
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Eventos exclusivos</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">No</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Algunos</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Sí</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Sí + VIP</td>
              </tr>
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Asistencia vial</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Básica</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Básica</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Completa</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Premium</td>
              </tr>
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Seguro de accidentes</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">No</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Básico</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Básico</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">Completo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

export default MembershipTab;