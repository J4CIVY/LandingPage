import React from 'react';
import { FaHeadset } from 'react-icons/fa';

const ComplaintsTab = ({ newComplaint, setNewComplaint, handleComplaintSubmit, userData, statusIcon }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Radicar nueva PQRSDF</h3>
      <form onSubmit={handleComplaintSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            name="type"
            value={newComplaint.type}
            onChange={(e) => setNewComplaint({ ...newComplaint, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-950"
          >
            <option value="Petición">Petición</option>
            <option value="Queja">Queja</option>
            <option value="Reclamo">Reclamo</option>
            <option value="Solicitud">Solicitud</option>
            <option value="Denuncia">Denuncia</option>
            <option value="Felicitación">Felicitación</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
          <input
            type="text"
            name="subject"
            value={newComplaint.subject}
            onChange={(e) => setNewComplaint({ ...newComplaint, subject: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-950"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            name="description"
            value={newComplaint.description}
            onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-950"
            rows="4"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-slate-950 hover:bg-green-500 text-white px-4 py-2 rounded-md transition"
        >
          Enviar PQRSDF
        </button>
      </form>
    </div>

    <div>
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial de PQRSDF</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Asunto</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userData.complaints.map(item => (
                <tr key={item.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.date}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.type}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{item.subject}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.status === 'En proceso' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'Cerrado' ? 'bg-gray-100 text-gray-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                      {statusIcon(item.status)}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <button className="text-green-500 hover:text-orange-900 mr-2">Detalles</button>
                    {item.status === 'En proceso' && (
                      <button className="text-blue-600 hover:text-blue-900">Seguimiento</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
        <h4 className="font-medium text-blue-800 mb-2">Tipos de PQRSDF:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li><strong>Petición:</strong> Solicitud de información o servicios</li>
          <li><strong>Queja:</strong> Manifestación de inconformidad</li>
          <li><strong>Reclamo:</strong> Cuando un derecho ha sido vulnerado</li>
          <li><strong>Solicitud:</strong> Petición específica de un servicio</li>
          <li><strong>Denuncia:</strong> Reporte de conductas inapropiadas</li>
          <li><strong>Felicitación:</strong> Reconocimiento a servicios o personas</li>
        </ul>
      </div>
    </div>
  </div>
);

export default ComplaintsTab;