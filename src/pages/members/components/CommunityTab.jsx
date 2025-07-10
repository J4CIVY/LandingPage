import React from 'react';
import { FaUsers, FaMapMarkedAlt, FaChartLine, FaHistory } from 'react-icons/fa';

const CommunityTab = ({ userData }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Comunidad BSK</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-bold text-slate-950">1,250</div>
          <div className="text-xs sm:text-sm text-gray-600">Miembros Activos</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-bold text-slate-950">48</div>
          <div className="text-xs sm:text-sm text-gray-600">Rodadas este año</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-bold text-slate-950">15</div>
          <div className="text-xs sm:text-sm text-gray-600">Ciudades</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-bold text-slate-950">8</div>
          <div className="text-xs sm:text-sm text-gray-600">Años de historia</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
          <div className="text-slate-950 mb-3 mx-auto" style={{ width: '32px', height: '32px' }}>
            <FaUsers size={32} />
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Grupos Locales</h4>
          <p className="text-sm text-gray-600 mb-4">Conecta con miembros en tu ciudad</p>
          <button className="bg-slate-950 hover:bg-green-500 text-white px-4 py-2 rounded-md text-sm transition">
            Explorar
          </button>
        </div>
        <div className="bg-white border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
          <div className="text-slate-950 mb-3 mx-auto" style={{ width: '32px', height: '32px' }}>
            <FaMapMarkedAlt size={32} />
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Rutas Compartidas</h4>
          <p className="text-sm text-gray-600 mb-4">Descubre rutas favoritas de la comunidad</p>
          <button className="bg-slate-950 hover:bg-green-500 text-white px-4 py-2 rounded-md text-sm transition">
            Ver Mapa
          </button>
        </div>
        <div className="bg-white border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
          <div className="text-slate-950 mb-3 mx-auto" style={{ width: '32px', height: '32px' }}>
            <FaChartLine size={32} />
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Clasificaciones</h4>
          <p className="text-sm text-gray-600 mb-4">Top miembros por puntos y participación</p>
          <button className="bg-slate-950 hover:bg-green-500 text-white px-4 py-2 rounded-md text-sm transition">
            Ver Ranking
          </button>
        </div>
        <div className="bg-white border rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
          <div className="text-slate-950 mb-3 mx-auto" style={{ width: '32px', height: '32px' }}>
            <FaHistory size={32} />
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Archivo Histórico</h4>
          <p className="text-sm text-gray-600 mb-4">Fotos y memorias de eventos pasados</p>
          <button className="bg-slate-950 hover:bg-green-500 text-white px-4 py-2 rounded-md text-sm transition">
            Explorar
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-4">Anuncios del Club</h4>
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <div className="text-sm text-gray-500 mb-1">2023-10-01</div>
            <div className="font-medium text-gray-800 mb-2">Nueva política de seguridad en rodadas</div>
            <div className="text-sm text-gray-600 mb-2">
              A partir del 1 de noviembre se implementarán nuevos protocolos de seguridad para todas las rodadas oficiales del club.
            </div>
            <button className="text-green-500 hover:text-red-500 text-sm font-medium">
              Leer más
            </button>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <div className="text-sm text-gray-500 mb-1">2023-09-20</div>
            <div className="font-medium text-gray-800 mb-2">Elecciones consejo directivo 2024</div>
            <div className="text-sm text-gray-600 mb-2">
              Conoce los candidatos y fechas importantes para las elecciones del consejo directivo del próximo año.
            </div>
            <button className="text-green-500 hover:text-red-500 text-sm font-medium">
              Leer más
            </button>
          </div>
          <button className="text-green-500 hover:text-red-500 text-sm font-medium mt-2">
            Ver todos los anuncios
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityTab;