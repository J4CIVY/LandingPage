import React, { useState } from "react";
import Header from "../components/shared/Header";

const Documents = ({ showMenu }) => {
  const [activeDoc, setActiveDoc] = useState("statutes");
  const [searchTerm, setSearchTerm] = useState("");

  // Documentos legales organizados por categorías
  const legalDocuments = {
    constitucion: {
      title: "Estatutos Constitutivos",
      lastUpdate: "15/03/2023",
      content: `
        ARTÍCULO 1. CONSTITUCIÓN: BSK Motorcycle Team se constituye como club de motociclistas...
        ARTÍCULO 2. OBJETIVOS: Promover la cultura motociclística responsable...
        [Documento completo en PDF]`
    },
    codigoEtica: {
      title: "Código de Ética y Conducta",
      lastUpdate: "22/05/2023",
      content: `
        SECCIÓN 1. COMPORTAMIENTO: Todo miembro actuará con respeto hacia...
        SECCIÓN 2. SEGURIDAD: Uso obligatorio de equipo de protección en...
        [Documento completo en PDF]`
    },
    proteccionDatos: {
      title: "Política de Protección de Datos",
      lastUpdate: "10/01/2023",
      content: `
        CAPÍTULO III. TRATAMIENTO DE DATOS: Los datos personales recolectados...
        [Documento completo en PDF]`
    },
    reglamentoEventos: {
      title: "Reglamento de Eventos",
      lastUpdate: "30/07/2023",
      content: `
        3.1 NORMAS DE CONDUCCIÓN: Formación en V para rutas grupales...
        3.2 PROTOCOLOS DE EMERGENCIA: Actuación en caso de accidente...
        [Documento completo en PDF]`
    }
  };

  // Documentos operativos
  const operationalDocuments = {
    manualMembresias: {
      title: "Manual de Membresías",
      lastUpdate: "05/04/2023",
      content: `
        - Tipos: Básica, Premium, VIP
        - Beneficios por categoría
        - Proceso de renovación...
        [Documento completo en PDF]`
    },
    protocoloSOS: {
      title: "Protocolo de Emergencias SOS",
      lastUpdate: "18/06/2023",
      content: `
        PASO 1: Evaluación del escenario
        PASO 2: Activación de red de apoyo...
        [Documento completo en PDF]`
    }
  };

  // Filtrado de documentos
  const filteredDocs = {
    ...legalDocuments,
    ...operationalDocuments
  };

  return (
    <div className={`py-2 px-2 transition-all duration-300 ${showMenu ? "ml-28" : "ml-0"}`}>
      <Header showMenu={showMenu} />
      
      {/* Hero Section */}
      <section className="bg-[#000031] text-white py-16 px-4 md:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Documentos Institucionales</h1>
          <p className="text-xl md:text-2xl text-[#00ff99]">
            Marco legal y operativo de BSK Motorcycle Team
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de navegación */}
          <div className="lg:w-1/4">
            <div className="bg-[#f8f9fa] rounded-xl shadow-sm p-6 sticky top-4">
              {/* Buscador */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Buscar documento..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#00ff99] focus:border-[#00ff99]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Categorías */}
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#000031] mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#00ff99]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Documentos Legales
                </h3>
                {Object.entries(legalDocuments).map(([key, doc]) => (
                  <button
                    key={key}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      activeDoc === key 
                        ? "bg-[#000031] text-white" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveDoc(key)}
                  >
                    {doc.title}
                  </button>
                ))}

                <h3 className="text-lg font-bold text-[#000031] mt-6 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#00ff99]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Documentos Operativos
                </h3>
                {Object.entries(operationalDocuments).map(([key, doc]) => (
                  <button
                    key={key}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      activeDoc === key 
                        ? "bg-[#000031] text-white" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveDoc(key)}
                  >
                    {doc.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contenido del documento */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Encabezado del documento */}
              <div className="bg-[#000031] px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">{filteredDocs[activeDoc]?.title}</h2>
                  <p className="text-[#00ff99] text-sm">Última actualización: {filteredDocs[activeDoc]?.lastUpdate}</p>
                </div>
                <button className="bg-[#00ff99] text-[#000031] font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar PDF
                </button>
              </div>

              {/* Cuerpo del documento */}
              <div className="p-6 md:p-8">
                {/* Sello de autenticidad */}
                <div className="flex justify-center mb-8">
                  <div className="border-2 border-[#00ff99] rounded-full p-4 inline-flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#00ff99]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>

                {/* Texto del documento (simulado) */}
                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-6">
                    <strong className="text-[#000031]">BSK Motorcycle Team</strong> - Documento institucional de carácter {activeDoc in legalDocuments ? "legal" : "operativo"}.
                  </p>

                  <div className="border-l-4 border-[#00ff99] pl-4 mb-6">
                    <p className="text-gray-600 italic">
                      "Este documento establece los lineamientos oficiales del club y requiere estricto cumplimiento por parte de todos los miembros."
                    </p>
                  </div>

                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm md:text-base">
                    {filteredDocs[activeDoc]?.content}
                  </pre>

                  {/* Sección de firmas (para documentos legales) */}
                  {activeDoc in legalDocuments && (
                    <div className="mt-12 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-bold text-[#000031] mb-4">Certificación</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-gray-600 mb-2">_________________________</p>
                          <p className="text-[#000031] font-medium">Presidente</p>
                          <p className="text-sm text-gray-500">BSK Motorcycle Team</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-2">_________________________</p>
                          <p className="text-[#000031] font-medium">Secretario General</p>
                          <p className="text-sm text-gray-500">BSK Motorcycle Team</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pie de documento */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <p className="text-sm text-gray-500 mb-2 md:mb-0">
                    Documento válido según acta #{Math.floor(1000 + Math.random() * 9000)}
                  </p>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-500">Generado el {new Date().toLocaleDateString('es-CO')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Nota legal */}
            <div className="mt-6 bg-[#f0f9ff] border border-[#00ff99] rounded-xl p-6">
              <h3 className="text-xl font-bold text-[#000031] mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2 text-[#00ff99]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Nota Legal
              </h3>
              <p className="text-gray-700">
                Todos los documentos institucionales de BSK Motorcycle Team están protegidos bajo derechos de autor y 
                regulados por las leyes colombianas. La reproducción no autorizada está prohibida.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;