import React, { useState, useMemo } from "react"; // Added useMemo for performance
import { 
  FaFileAlt, 
  FaCogs, 
  FaDownload, 
  FaShieldAlt, 
  FaClock, 
  FaExclamationTriangle,
  FaSearch
} from "react-icons/fa";
import { 
  GiArchiveResearch,
  GiSettingsKnobs
} from "react-icons/gi";

const Documents = () => {
  const [activeDoc, setActiveDoc] = useState("constitucion"); // Changed initial activeDoc to a valid key
  const [searchTerm, setSearchTerm] = useState("");

  // Documentos legales organizados por categorías
  const legalDocuments = useMemo(() => ({ // Memoized to prevent re-creation on every render
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
  }), []);

  // Documentos operativos
  const operationalDocuments = useMemo(() => ({ // Memoized to prevent re-creation on every render
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
  }), []);

  // Combine all documents and filter based on search term
  const allDocuments = useMemo(() => ({ // Memoized to prevent re-creation on every render
    ...legalDocuments,
    ...operationalDocuments
  }), [legalDocuments, operationalDocuments]);

  const filteredDocumentKeys = useMemo(() => { // Memoized to prevent re-calculation on every render
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return Object.keys(allDocuments).filter(key => 
      allDocuments[key].title.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm, allDocuments]);

  // Ensure activeDoc is always a valid key after filtering or initial load
  useEffect(() => {
    if (!allDocuments[activeDoc] && filteredDocumentKeys.length > 0) {
      setActiveDoc(filteredDocumentKeys[0]); // Set to the first available document if current is not found
    } else if (filteredDocumentKeys.length === 0) {
      setActiveDoc(null); // No documents match the filter
    }
  }, [activeDoc, filteredDocumentKeys, allDocuments]);

  const currentDoc = activeDoc ? allDocuments[activeDoc] : null;

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="bg-slate-950 text-white py-16 px-4 md:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Documentos Institucionales</h1>
          <p className="text-xl md:text-2xl text-green-400 flex items-center justify-center">
            Marco legal y operativo de BSK Motorcycle Team
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de navegación */}
          <div className="lg:w-1/4">
            <div className="bg-gray-100 rounded-xl shadow-sm p-6 sticky top-4">
              {/* Buscador */}
              <div className="mb-6 relative">
                <label htmlFor="document-search" className="sr-only">Buscar documento</label> {/* Added sr-only label for accessibility */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" aria-hidden="true" /> {/* Added aria-hidden */}
                </div>
                <input
                  type="text"
                  id="document-search"
                  placeholder="Buscar documento..."
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-400 focus:border-green-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Buscar documento" // Added aria-label for accessibility
                />
              </div>

              {/* Categorías */}
              <nav aria-label="Document Categories"> {/* Added nav for accessibility */}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-950 mb-3 flex items-center">
                    <GiArchiveResearch className="w-5 h-5 mr-2 text-green-400" aria-hidden="true" />
                    Documentos Legales
                  </h3>
                  {Object.entries(legalDocuments)
                    .filter(([key]) => filteredDocumentKeys.includes(key)) // Filter based on search
                    .map(([key, doc]) => (
                      <button
                        key={key}
                        className={`w-full text-left px-4 py-2 rounded-lg transition ${
                          activeDoc === key 
                            ? "bg-slate-950 text-white" 
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setActiveDoc(key)}
                        aria-current={activeDoc === key ? "page" : undefined} // Added aria-current for accessibility
                      >
                        {doc.title}
                      </button>
                    ))}

                  <h3 className="text-lg font-bold text-slate-950 mt-6 mb-3 flex items-center">
                    <GiSettingsKnobs className="w-5 h-5 mr-2 text-green-400" aria-hidden="true" />
                    Documentos Operativos
                  </h3>
                  {Object.entries(operationalDocuments)
                    .filter(([key]) => filteredDocumentKeys.includes(key)) // Filter based on search
                    .map(([key, doc]) => (
                      <button
                        key={key}
                        className={`w-full text-left px-4 py-2 rounded-lg transition ${
                          activeDoc === key 
                            ? "bg-slate-950 text-white" 
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setActiveDoc(key)}
                        aria-current={activeDoc === key ? "page" : undefined} // Added aria-current for accessibility
                      >
                        {doc.title}
                      </button>
                    ))}
                </div>
              </nav>
            </div>
          </div>

          {/* Contenido del documento */}
          <div className="lg:w-3/4">
            {currentDoc ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Encabezado del documento */}
                <div className="bg-slate-950 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{currentDoc.title}</h2>
                    <p className="text-green-400 text-sm flex items-center">
                      <FaClock className="mr-1" aria-hidden="true" /> Última actualización: {currentDoc.lastUpdate}
                    </p>
                  </div>
                  <button 
                    className="bg-green-400 text-slate-950 font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition flex items-center"
                    aria-label={`Descargar PDF de ${currentDoc.title}`} // Added aria-label for accessibility
                  >
                    <FaDownload className="mr-2" aria-hidden="true" />
                    Descargar PDF
                  </button>
                </div>

                {/* Cuerpo del documento */}
                <div className="p-6 md:p-8">
                  {/* Sello de autenticidad */}
                  <div className="flex justify-center mb-8">
                    <div className="border-2 border-green-400 rounded-full p-4 inline-flex items-center justify-center">
                      <FaShieldAlt className="w-12 h-12 text-green-400" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Texto del documento (simulado) */}
                  <div className="prose max-w-none">
                    <p className="text-gray-700 mb-6">
                      <strong className="text-slate-950">BSK Motorcycle Team</strong> - Documento institucional de carácter {activeDoc in legalDocuments ? "legal" : "operativo"}.
                    </p>

                    <div className="border-l-4 border-green-400 pl-4 mb-6">
                      <p className="text-gray-600 italic">
                        "Este documento establece los lineamientos oficiales del club y requiere estricto cumplimiento por parte de todos los miembros."
                      </p>
                    </div>

                    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm md:text-base">
                      {currentDoc.content}
                    </pre>

                    {/* Sección de firmas (para documentos legales) */}
                    {activeDoc in legalDocuments && (
                      <div className="mt-12 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-bold text-slate-950 mb-4">Certificación</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <p className="text-gray-600 mb-2">_________________________</p>
                            <p className="text-slate-950 font-medium">Presidente</p>
                            <p className="text-sm text-gray-500">BSK Motorcycle Team</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-2">_________________________</p>
                            <p className="text-slate-950 font-medium">Secretario General</p>
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
                      <FaClock className="w-5 h-5 text-gray-400 mr-2" aria-hidden="true" />
                      <span className="text-sm text-gray-500">Generado el {new Date().toLocaleDateString('es-CO')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-600">
                <p>No se encontró el documento o no hay documentos que coincidan con la búsqueda.</p>
              </div>
            )}

            {/* Nota legal */}
            <div className="mt-6 bg-slate-950 border border-green-400 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center">
                <FaExclamationTriangle className="w-6 h-6 mr-2 text-green-400" aria-hidden="true" />
                Nota Legal
              </h3>
              <p className="text-gray-400">
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