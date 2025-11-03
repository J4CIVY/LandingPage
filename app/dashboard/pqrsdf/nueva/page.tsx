'use client';

import { useState, useEffect, Suspense, type ChangeEvent, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FaArrowLeft, 
  FaPaperclip, 
  FaTimes, 
  FaCheck, 
  FaSpinner,
  FaExclamationCircle,
  FaUniversity,
  FaCreditCard
} from 'react-icons/fa';
import { useEmailValidation } from '@/hooks/useEmailValidation';
import { usePhoneValidation } from '@/hooks/usePhoneValidation';

// Importar tipos y servicios
import { 
  CrearSolicitudDto, 
  CATEGORIAS_SOLICITUD, 
  SolicitudCategoria,
  SolicitudSubcategoria,
  ICONOS_CATEGORIA,
  DatosBancariosReembolso 
} from '@/types/pqrsdf';
import { PQRSDFService } from '@/lib/services/pqrsdf-service';

// Tipos de documento
const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'NIT', label: 'NIT' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'PA', label: 'Pasaporte' }
] as const;

// Bancos colombianos principales
const BANCOS = [
  'Bancolombia',
  'Banco de Bogotá',
  'Davivienda',
  'BBVA Colombia',
  'Banco Popular',
  'Banco de Occidente',
  'Banco Caja Social',
  'Banco AV Villas',
  'Banco Falabella',
  'Banco Agrario',
  'Banco Pichincha',
  'Banco Cooperativo Coopcentral',
  'Colpatria',
  'Citibank',
  'Scotiabank Colpatria',
  'Nequi',
  'Daviplata',
  'Lulo Bank',
  'Otro'
];

interface EventoRegistrado {
  id: string;
  nombre: string;
  fecha: string;
  precio: number;
}

function NuevaSolicitudPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Validation hooks
  const emailValidation = useEmailValidation();
  const phoneValidation = usePhoneValidation();
  
  // Estados del formulario
  const [formulario, setFormulario] = useState<CrearSolicitudDto>({
    categoria: 'peticion',
    asunto: '',
    descripcion: '',
    adjuntos: []
  });
  
  // Estado para datos bancarios
  const [datosBancarios, setDatosBancarios] = useState<DatosBancariosReembolso>({
    nombreTitular: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    banco: '',
    tipoCuenta: 'ahorros',
    numeroCuenta: '',
    emailConfirmacion: '',
    telefonoContacto: ''
  });
  
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [exito, setExito] = useState(false);
  const [eventosRegistrados, setEventosRegistrados] = useState<EventoRegistrado[]>([]);
  const [cargandoEventos, setCargandoEventos] = useState(false);
  
  // Leer parámetros de URL y pre-llenar formulario
  useEffect(() => {
    const categoria = searchParams.get('categoria') as SolicitudCategoria;
    const subcategoria = searchParams.get('subcategoria') as SolicitudSubcategoria;
    const eventoId = searchParams.get('eventoId');
    const eventoNombre = searchParams.get('eventoNombre');
    const precio = searchParams.get('precio');
    
    if (categoria) {
      setFormulario(prev => ({
        ...prev,
        categoria,
        subcategoria,
        eventoId: eventoId || undefined,
        eventoNombre: eventoNombre || undefined,
        montoReembolso: precio ? parseFloat(precio) : undefined,
        asunto: subcategoria === 'reembolso' && eventoNombre 
          ? `Solicitud de reembolso - ${eventoNombre}` 
          : '',
        descripcion: subcategoria === 'reembolso' 
          ? `Solicito el reembolso de mi inscripción al evento "${eventoNombre}" por un valor de $${precio ? parseFloat(precio).toLocaleString('es-CO') : '0'}.` 
          : ''
      }));
      
      // Si es reembolso, pre-llenar algunos datos bancarios
      if (subcategoria === 'reembolso' && user) {
        setDatosBancarios(prev => ({
          ...prev,
          nombreTitular: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
          emailConfirmacion: user.email || ''
        }));
      }
    }
  }, [searchParams, user]);
  
  // Cargar eventos registrados si es reembolso
  useEffect(() => {
    const cargarEventosRegistrados = async () => {
      if (formulario.subcategoria === 'reembolso' && user) {
        setCargandoEventos(true);
        try {
          const response = await fetch('/api/events/user-registrations');
          if (response.ok) {
            const data = await response.json();
            setEventosRegistrados(data.events || []);
          }
        } catch (error) {
          console.error('Error al cargar eventos:', error);
        } finally {
          setCargandoEventos(false);
        }
      }
    };
    
    void cargarEventosRegistrados();
  }, [formulario.subcategoria, user]);

  // Validación del formulario
  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formulario.categoria) {
      nuevosErrores.categoria = 'La categoría es obligatoria';
    }

    if (!formulario.asunto.trim()) {
      nuevosErrores.asunto = 'El asunto es obligatorio';
    } else if (formulario.asunto.trim().length < 5) {
      nuevosErrores.asunto = 'El asunto debe tener al menos 5 caracteres';
    } else if (formulario.asunto.trim().length > 200) {
      nuevosErrores.asunto = 'El asunto no puede exceder 200 caracteres';
    }

    if (!formulario.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    } else if (formulario.descripcion.trim().length < 20) {
      nuevosErrores.descripcion = 'La descripción debe tener al menos 20 caracteres';
    } else if (formulario.descripcion.trim().length > 2000) {
      nuevosErrores.descripcion = 'La descripción no puede exceder 2000 caracteres';
    }

    // Validaciones específicas para reembolsos
    if (formulario.subcategoria === 'reembolso') {
      if (!formulario.eventoId) {
        nuevosErrores.evento = 'Debes seleccionar un evento';
      }
      
      if (!datosBancarios.nombreTitular.trim()) {
        nuevosErrores.nombreTitular = 'El nombre del titular es obligatorio';
      }
      
      if (!datosBancarios.numeroDocumento.trim()) {
        nuevosErrores.numeroDocumento = 'El número de documento es obligatorio';
      } else if (!/^\d{6,12}$/.test(datosBancarios.numeroDocumento)) {
        nuevosErrores.numeroDocumento = 'Número de documento inválido (6-12 dígitos)';
      }
      
      if (!datosBancarios.banco.trim()) {
        nuevosErrores.banco = 'Debes seleccionar un banco';
      }
      
      if (!datosBancarios.numeroCuenta.trim()) {
        nuevosErrores.numeroCuenta = 'El número de cuenta es obligatorio';
      } else if (!/^\d{8,20}$/.test(datosBancarios.numeroCuenta)) {
        nuevosErrores.numeroCuenta = 'Número de cuenta inválido (8-20 dígitos)';
      }
      
      if (!datosBancarios.emailConfirmacion.trim()) {
        nuevosErrores.emailConfirmacion = 'El correo de confirmación es obligatorio';
      } else {
        // Use validation hook instead of regex
        emailValidation.handleChange(datosBancarios.emailConfirmacion);
        if (!emailValidation.isValid) {
          nuevosErrores.emailConfirmacion = emailValidation.error || 'Correo electrónico inválido';
        }
      }
      
      if (!datosBancarios.telefonoContacto.trim()) {
        nuevosErrores.telefonoContacto = 'El teléfono de contacto es obligatorio';
      } else {
        // Use validation hook instead of regex
        phoneValidation.handleChange(datosBancarios.telefonoContacto);
        if (!phoneValidation.isValid) {
          nuevosErrores.telefonoContacto = phoneValidation.error || 'Teléfono inválido (10 dígitos, debe iniciar con 3)';
        }
      }
    }

    // Validar archivos
    if (archivosSeleccionados.length > 5) {
      nuevosErrores.adjuntos = 'No puedes subir más de 5 archivos';
    }

    const tamanoTotal = archivosSeleccionados.reduce((total, archivo) => total + archivo.size, 0);
    const tamanoLimite = 10 * 1024 * 1024; // 10MB
    if (tamanoTotal > tamanoLimite) {
      nuevosErrores.adjuntos = 'El tamaño total de los archivos no puede exceder 10MB';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar cambios en el formulario
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (campo: keyof CrearSolicitudDto, valor: any) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Limpiar error del campo
    if (errores[campo]) {
      setErrores(prev => {
        const nuevos = { ...prev };
        delete nuevos[campo];
        return nuevos;
      });
    }
  };

  // Manejar cambios en datos bancarios
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDatosBancariosChange = (campo: keyof DatosBancariosReembolso, valor: any) => {
    setDatosBancarios(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Limpiar error del campo
    if (errores[campo]) {
      setErrores(prev => {
        const nuevos = { ...prev };
        delete nuevos[campo];
        return nuevos;
      });
    }
  };

  // Manejar selección de archivos
  const handleArchivos = (e: ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(e.target.files || []);
    setArchivosSeleccionados(prev => [...prev, ...archivos]);
    
    // Limpiar error de adjuntos
    if (errores.adjuntos) {
      setErrores(prev => {
        const nuevos = { ...prev };
        delete nuevos.adjuntos;
        return nuevos;
      });
    }
  };

  // Remover archivo
  const removerArchivo = (index: number) => {
    setArchivosSeleccionados(prev => prev.filter((_, i) => i !== index));
  };

  // Formatear tamaño de archivo
  const formatearTamano = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const tamanos = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamanos[i];
  };

  // Enviar formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validarFormulario() || !user) return;

    setEnviando(true);
    try {
      const datosEnvio: CrearSolicitudDto = {
        ...formulario,
        adjuntos: archivosSeleccionados,
        // Incluir datos bancarios si es un reembolso
        ...(formulario.subcategoria === 'reembolso' && {
          datosBancarios
        })
      };

      const solicitudCreada = await PQRSDFService.crearSolicitud(user._id as string, datosEnvio);
      
      setExito(true);
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push(`/dashboard/pqrsdf/${solicitudCreada.id}`);
      }, 2000);

    } catch (error) {
      console.error('Error al crear solicitud:', error);
      setErrores({
        general: 'Error al crear la solicitud. Por favor, intenta nuevamente.'
      });
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
                ¡Solicitud Creada!
              </h2>
              <p className="text-gray-600 dark:text-slate-400 mb-4">
                Tu solicitud ha sido enviada exitosamente. Te redirigiremos a los detalles en un momento.
              </p>
              <div className="flex items-center justify-center">
                <FaSpinner className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                <span className="text-sm text-gray-500 dark:text-slate-400">Redirigiendo...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/pqrsdf"
              className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 mb-4"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Volver a Solicitudes
            </Link>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">
              Nueva Solicitud PQRSDF
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              Completa el formulario para enviar tu solicitud
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              {/* Error general */}
              {errores.general && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center">
                    <FaExclamationCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    <span className="text-red-700 dark:text-red-300">{errores.general}</span>
                  </div>
                </div>
              )}

              {/* Categoría */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(CATEGORIAS_SOLICITUD).map(([key, label]) => (
                    <div
                      key={key}
                      onClick={() => handleChange('categoria', key as SolicitudCategoria)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        formulario.categoria === key
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {ICONOS_CATEGORIA[key as SolicitudCategoria]}
                        </span>
                        <span className={`font-medium ${
                          formulario.categoria === key
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-gray-900 dark:text-slate-100'
                        }`}>
                          {label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {errores.categoria && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errores.categoria}</p>
                )}
              </div>

              {/* Asunto */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Asunto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formulario.asunto}
                  onChange={(e) => handleChange('asunto', e.target.value)}
                  placeholder="Describe brevemente tu solicitud"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 ${
                    errores.asunto
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-slate-600'
                  }`}
                  maxLength={200}
                />
                <div className="mt-1 flex justify-between">
                  {errores.asunto ? (
                    <p className="text-sm text-red-600 dark:text-red-400">{errores.asunto}</p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Mínimo 5 caracteres
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {formulario.asunto.length}/200
                  </p>
                </div>
              </div>

              {/* Descripción */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formulario.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  placeholder="Proporciona todos los detalles relevantes de tu solicitud"
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 resize-none ${
                    errores.descripcion
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-slate-600'
                  }`}
                  maxLength={2000}
                />
                <div className="mt-1 flex justify-between">
                  {errores.descripcion ? (
                    <p className="text-sm text-red-600 dark:text-red-400">{errores.descripcion}</p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Mínimo 20 caracteres
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {formulario.descripcion.length}/2000
                  </p>
                </div>
              </div>

              {/* Campos específicos para reembolsos */}
              {formulario.subcategoria === 'reembolso' && (
                <div className="mb-6 space-y-6 border-t border-gray-200 dark:border-slate-700 pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FaUniversity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                      Información de Reembolso
                    </h3>
                  </div>

                  {/* Selector de Evento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Evento <span className="text-red-500">*</span>
                    </label>
                    {cargandoEventos ? (
                      <div className="flex items-center justify-center py-4">
                        <FaSpinner className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="ml-2 text-sm text-gray-600 dark:text-slate-400">Cargando eventos...</span>
                      </div>
                    ) : eventosRegistrados.length > 0 ? (
                      <select
                        value={formulario.eventoId || ''}
                        onChange={(e) => {
                          const eventoSeleccionado = eventosRegistrados.find(ev => ev.id === e.target.value);
                          handleChange('eventoId', e.target.value);
                          if (eventoSeleccionado) {
                            handleChange('eventoNombre', eventoSeleccionado.nombre);
                            handleChange('montoReembolso', eventoSeleccionado.precio);
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 ${
                          errores.evento
                            ? 'border-red-300 dark:border-red-600'
                            : 'border-gray-300 dark:border-slate-600'
                        }`}
                      >
                        <option value="">Selecciona el evento</option>
                        {eventosRegistrados.map((evento) => (
                          <option key={evento.id} value={evento.id}>
                            {evento.nombre} - ${evento.precio.toLocaleString('es-CO')}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-slate-400 italic">
                        No tienes eventos registrados disponibles para reembolso.
                      </p>
                    )}
                    {errores.evento && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errores.evento}</p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="flex items-center space-x-2 border-t border-gray-200 dark:border-slate-700 pt-4">
                    <FaCreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                      Datos Bancarios para el Reembolso
                    </h4>
                  </div>

                  {/* Nombre del Titular */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Nombre del Titular de la Cuenta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={datosBancarios.nombreTitular}
                      onChange={(e) => handleDatosBancariosChange('nombreTitular', e.target.value)}
                      placeholder="Nombre completo del titular"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 ${
                        errores.nombreTitular
                          ? 'border-red-300 dark:border-red-600'
                          : 'border-gray-300 dark:border-slate-600'
                      }`}
                    />
                    {errores.nombreTitular && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errores.nombreTitular}</p>
                    )}
                  </div>

                  {/* Tipo y Número de Documento */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Tipo de Documento <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={datosBancarios.tipoDocumento}
                        onChange={(e) => handleDatosBancariosChange('tipoDocumento', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                      >
                        {TIPOS_DOCUMENTO.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Número de Documento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={datosBancarios.numeroDocumento}
                        onChange={(e) => handleDatosBancariosChange('numeroDocumento', e.target.value.replace(/\D/g, ''))}
                        placeholder="Ej: 1234567890"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 ${
                          errores.numeroDocumento
                            ? 'border-red-300 dark:border-red-600'
                            : 'border-gray-300 dark:border-slate-600'
                        }`}
                      />
                      {errores.numeroDocumento && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errores.numeroDocumento}</p>
                      )}
                    </div>
                  </div>

                  {/* Banco */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Banco <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={datosBancarios.banco}
                      onChange={(e) => handleDatosBancariosChange('banco', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 ${
                        errores.banco
                          ? 'border-red-300 dark:border-red-600'
                          : 'border-gray-300 dark:border-slate-600'
                      }`}
                    >
                      <option value="">Selecciona tu banco</option>
                      {BANCOS.map(banco => (
                        <option key={banco} value={banco}>
                          {banco}
                        </option>
                      ))}
                    </select>
                    {errores.banco && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errores.banco}</p>
                    )}
                  </div>

                  {/* Tipo de Cuenta */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Tipo de Cuenta <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="tipoCuenta"
                          value="ahorros"
                          checked={datosBancarios.tipoCuenta === 'ahorros'}
                          onChange={(e) => handleDatosBancariosChange('tipoCuenta', e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Ahorros</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="tipoCuenta"
                          value="corriente"
                          checked={datosBancarios.tipoCuenta === 'corriente'}
                          onChange={(e) => handleDatosBancariosChange('tipoCuenta', e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Corriente</span>
                      </label>
                    </div>
                  </div>

                  {/* Número de Cuenta */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Número de Cuenta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={datosBancarios.numeroCuenta}
                      onChange={(e) => handleDatosBancariosChange('numeroCuenta', e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej: 1234567890"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 ${
                        errores.numeroCuenta
                          ? 'border-red-300 dark:border-red-600'
                          : 'border-gray-300 dark:border-slate-600'
                      }`}
                    />
                    {errores.numeroCuenta && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errores.numeroCuenta}</p>
                    )}
                  </div>

                  {/* Correo de Confirmación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Correo de Confirmación <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={datosBancarios.emailConfirmacion}
                      onChange={(e) => {
                        emailValidation.handleChange(e.target.value);
                        handleDatosBancariosChange('emailConfirmacion', e.target.value);
                      }}
                      placeholder="correo@ejemplo.com"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 ${
                        errores.emailConfirmacion || emailValidation.error
                          ? 'border-red-300 dark:border-red-600'
                          : 'border-gray-300 dark:border-slate-600'
                      }`}
                    />
                    {emailValidation.error && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{emailValidation.error}</p>
                    )}
                    {errores.emailConfirmacion && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errores.emailConfirmacion}</p>
                    )}
                  </div>

                  {/* Teléfono de Contacto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Teléfono de Contacto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={datosBancarios.telefonoContacto}
                      onChange={(e) => {
                        const cleanedValue = e.target.value.replace(/\D/g, '');
                        phoneValidation.handleChange(cleanedValue);
                        handleDatosBancariosChange('telefonoContacto', cleanedValue);
                      }}
                      placeholder="3001234567"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 ${
                        errores.telefonoContacto || phoneValidation.error
                          ? 'border-red-300 dark:border-red-600'
                          : 'border-gray-300 dark:border-slate-600'
                      }`}
                    />
                    {phoneValidation.error && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{phoneValidation.error}</p>
                    )}
                    {errores.telefonoContacto && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errores.telefonoContacto}</p>
                    )}
                  </div>

                  {/* Nota informativa */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Nota importante:</strong> El reembolso se realizará a la cuenta bancaria proporcionada. Asegúrate de que todos los datos sean correctos para evitar retrasos en el procesamiento.
                    </p>
                  </div>
                </div>
              )}

              {/* Adjuntos */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Adjuntos (Opcional)
                </label>
                
                {/* Input para archivos */}
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleArchivos}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FaPaperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      Haz clic aquí para seleccionar archivos
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                      PDF, DOC, TXT, JPG, PNG (máx. 10MB total)
                    </p>
                  </label>
                </div>

                {/* Archivos seleccionados */}
                {archivosSeleccionados.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {archivosSeleccionados.map((archivo, index) => (
                      <div key={index} className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FaPaperclip className="w-4 h-4" />
                          <span>{archivo.name}</span>
                          <span className="text-gray-500">({formatearTamano(archivo.size)})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removerArchivo(index)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {errores.adjuntos && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errores.adjuntos}</p>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <Link
                href="/dashboard/pqrsdf"
                className="px-6 py-2 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200 text-center"
              >
                Cancelar
              </Link>
                            <button
                type="submit"
                disabled={enviando}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {enviando ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <FaCheck className="w-4 h-4 mr-2" />
                    Enviar Solicitud
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// Componente principal que envuelve con Suspense
export default function NuevaSolicitudPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
            <FaSpinner className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-slate-400">Cargando formulario...</p>
          </div>
        </div>
      </div>
    }>
      <NuevaSolicitudPageContent />
    </Suspense>
  );
}

