import React from 'react';
import { FaStar, FaHistory, FaTicketAlt } from 'react-icons/fa';

const PointsTab = ({ userData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-gradient-to-r from-slate-950 to-red-600 rounded-lg p-6 text-white shadow">
        <h3 className="text-xl font-semibold mb-2">Puntos Totales</h3>
        <div className="text-4xl font-bold">{userData.points}</div>
        <p className="text-white mt-2">Solo te faltan 250 puntos para el siguiente nivel</p>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Desglose de Puntos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-gray-600 text-sm">Rodadas</div>
            <div className="text-2xl font-bold text-slate-950">{userData.pointsBreakdown.rides}</div>
            <div className="text-xs text-gray-500">pts</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-gray-600 text-sm">Eventos</div>
            <div className="text-2xl font-bold text-slate-950">{userData.pointsBreakdown.events}</div>
            <div className="text-xs text-gray-500">pts</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-gray-600 text-sm">Consumo Aliados</div>
            <div className="text-2xl font-bold text-slate-950">{userData.pointsBreakdown.partners}</div>
            <div className="text-xs text-gray-500">pts</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-gray-600 text-sm">Otros</div>
            <div className="text-2xl font-bold text-slate-950">{userData.pointsBreakdown.others}</div>
            <div className="text-xs text-gray-500">pts</div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaHistory className="text-slate-950 mr-2" /> Historial de Puntos
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Puntos</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userData.pointsBreakdown.history.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{item.date}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{item.description}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-green-600">+{item.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaTicketAlt className="text-slate-950 mr-2" /> Recompensas Disponibles
        </h3>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-slate-950 font-bold text-right">500 pts</div>
            <h4 className="font-medium text-gray-800 mt-2">Descuento 10% en próximo taller</h4>
            <button className="mt-3 w-full bg-slate-950 hover:bg-green-500 text-white py-1 rounded-md text-sm transition">
              Canjear
            </button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-slate-950 font-bold text-right">1000 pts</div>
            <h4 className="font-medium text-gray-800 mt-2">Kit BSK Exclusivo</h4>
            <button className="mt-3 w-full bg-slate-950 hover:bg-green-500 text-white py-1 rounded-md text-sm transition">
              Canjear
            </button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-slate-950 font-bold text-right">1500 pts</div>
            <h4 className="font-medium text-gray-800 mt-2">Upgrade de Membresía por 3 meses</h4>
            <button className="mt-3 w-full bg-slate-950 hover:bg-green-500 text-white py-1 rounded-md text-sm transition">
              Canjear
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">¿Cómo ganar más puntos?</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Asistir a rodadas oficiales (+50 a +200 pts)</li>
          <li>Participar en talleres (+100 pts)</li>
          <li>Compras en aliados comerciales (5% del valor en pts)</li>
          <li>Invitar nuevos miembros (+500 pts)</li>
          <li>Organizar eventos (+300 pts)</li>
        </ul>
      </div>
    </div>
  </div>
);

export default PointsTab;