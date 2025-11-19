'use client';

import { useState, type ChangeEvent, type FormEvent } from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaRegEnvelope, FaRegClock } from 'react-icons/fa';
import ContactForm from '@/lib/components/shared/ContactForm';
import { useRecaptcha, RecaptchaActions } from '@/lib/recaptcha-client';
import { useEmailValidation } from '@/hooks/useEmailValidation';
import { usePhoneValidation } from '@/hooks/usePhoneValidation';
import apiClient from '@/lib/api-client';

interface ComplaintFormState {
  title: string;
  description: string;
  location: string;
  date: string;
  evidence: File | null;
}

interface PqrsdfFormState {
  type: string;
  name: string;
  idNumber: string;
  email: string;
  phone: string;
  subject: string;
  description: string;
}

interface ContactTabsProps {
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    hours: {
      administrative: string;
      operative: string;
    };
  };
}

/**
 * ✅ SEO OPTIMIZATION: Client Component for Contact Interactions
 * This component handles all client-side interactivity (tabs, forms, file uploads)
 * The parent Server Component provides SEO-optimized static content and metadata
 */
export default function ContactTabs({ contactInfo }: ContactTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("general");
  const [anonymousComplaint, setAnonymousComplaint] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { verify } = useRecaptcha();

  // Validation hooks for PQRSDF form
  const pqrsdfEmailValidation = useEmailValidation();
  const pqrsdfPhoneValidation = usePhoneValidation();

  const [complaintForm, setComplaintForm] = useState<ComplaintFormState>({
    title: "",
    description: "",
    location: "",
    date: "",
    evidence: null
  });

  const [pqrsdfForm, setPqrsdfForm] = useState<PqrsdfFormState>({
    type: "",
    name: "",
    idNumber: "",
    email: "",
    phone: "",
    subject: "",
    description: ""
  });

  const handleComplaintChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setComplaintForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePqrsdfChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update validation hooks for email and phone
    if (name === 'email') {
      pqrsdfEmailValidation.handleChange(value);
    } else if (name === 'phone') {
      pqrsdfPhoneValidation.handleChange(value);
    }
    
    setPqrsdfForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4', 'video/avi'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de archivo no permitido. Solo se aceptan: JPG, PNG, PDF, MP4, AVI');
        return;
      }
      
      if (file.size > maxSize) {
        alert('El archivo es muy grande. Máximo 10MB permitido.');
        return;
      }
      
      setComplaintForm(prev => ({ ...prev, evidence: file }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);

    try {
      // 1. Verify reCAPTCHA before submission
      const recaptchaToken = await verify(RecaptchaActions.CONTACT_FORM);
      
      if (!recaptchaToken) {
        alert('Error de verificación de seguridad. Por favor, recarga la página e intenta nuevamente.');
        setIsSubmitting(false);
        return;
      }

      let formDataToSend: Record<string, unknown> = {};
      const formType = activeTab;

      switch (formType) {
        case "complaint":
          formDataToSend = { 
            ...complaintForm, 
            anonymous: anonymousComplaint,
            formType: 'complaint',
            recaptchaToken 
          };
          break;
        case "pqrsdf":
          formDataToSend = { 
            ...pqrsdfForm,
            formType: 'pqrsdf',
            recaptchaToken 
          };
          break;
        default:
          alert('Tipo de formulario no válido');
          return;
      }

      // 2. Send to API with reCAPTCHA token
      // NestJS: POST /contact/send
      const result = await apiClient.post<{ message: string }>('/contact/send', formDataToSend as Record<string, unknown>);

      alert(result.message || 'Formulario enviado correctamente. Nos pondremos en contacto contigo pronto.');

      // Reset forms based on type
      if (formType === "complaint") {
        setComplaintForm({ title: "", description: "", location: "", date: "", evidence: null });
        setAnonymousComplaint(false);
      } else if (formType === "pqrsdf") {
        setPqrsdfForm({ type: "", name: "", idNumber: "", email: "", phone: "", subject: "", description: "" });
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      alert(error instanceof Error ? error.message : 'Error al enviar el formulario. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8 justify-center" aria-label="Tabs">
          {[
            { id: "general", label: "Contacto General"},
            { id: "complaint", label: "Denuncias"},
            { id: "pqrsdf", label: "PQRSDF"}
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 text-sm font-medium rounded-lg ${
                activeTab === tab.id
                  ? "bg-slate-950 dark:bg-green-500 text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
              id={`tab-${tab.id}`}
              role="tab"
              aria-controls={`panel-${tab.id}`}
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contacto General */}
      <div role="tabpanel" id="panel-general" aria-labelledby="tab-general" hidden={activeTab !== "general"}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-6">
              Información de Contacto del Motoclub
            </h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-slate-950 dark:bg-green-500 text-white">
                      <FaMapMarkerAlt className="text-xl" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-950 dark:text-white">
                    Dirección del Club de Motos en Bogotá
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {contactInfo.address}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-slate-950 dark:bg-green-500 text-white">
                      <FaPhoneAlt className="text-xl" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-950 dark:text-white">
                    Teléfono
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {contactInfo.phone}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-slate-950 dark:bg-green-500 text-white">
                      <FaRegEnvelope className="text-xl" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-950 dark:text-white">
                    Correo Electrónico
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {contactInfo.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-slate-950 dark:bg-green-500 text-white">
                      <FaRegClock className="text-xl" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-950 dark:text-white">
                    Horarios de Atención
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    <strong>Administrativo:</strong><br />{contactInfo.hours.administrative}<br />
                    <strong>Operativo:</strong> {contactInfo.hours.operative}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-6">
              Formulario de Contacto
            </h2>
            <ContactForm 
              defaultCategory="general"
              onSuccess={() => {
              }}
            />
          </div>
        </div>
      </div>

      {/* Denuncias */}
      <div role="tabpanel" id="panel-complaint" aria-labelledby="tab-complaint" hidden={activeTab !== "complaint"}>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-2">
                Sistema de Denuncias
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Reporta cualquier irregularidad, comportamiento inapropiado o violación de normas que hayas observado.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulario de Denuncias">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={anonymousComplaint}
                    onChange={(e) => setAnonymousComplaint(e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="anonymous" className="ml-2 text-sm text-yellow-800 dark:text-yellow-200">
                    Enviar denuncia de forma anónima
                  </label>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                  Si marcas esta opción, tu identidad será protegida en el proceso.
                </p>
              </div>

              <div>
                <label htmlFor="complaint-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título de la denuncia</label>
                <input 
                  type="text" 
                  id="complaint-title" 
                  name="title" 
                  required 
                  className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" 
                  value={complaintForm.title} 
                  onChange={handleComplaintChange}
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="complaint-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción detallada</label>
                <textarea 
                  id="complaint-description" 
                  name="description" 
                  rows={5} 
                  required 
                  className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" 
                  placeholder="Describe los hechos de manera clara y detallada..."
                  value={complaintForm.description} 
                  onChange={handleComplaintChange}
                  aria-required="true"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="complaint-location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lugar de los hechos</label>
                  <input 
                    type="text" 
                    id="complaint-location" 
                    name="location" 
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" 
                    value={complaintForm.location} 
                    onChange={handleComplaintChange}
                  />
                </div>
                <div>
                  <label htmlFor="complaint-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de los hechos</label>
                  <input 
                    type="date" 
                    id="complaint-date" 
                    name="date" 
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" 
                    value={complaintForm.date} 
                    onChange={handleComplaintChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="complaint-evidence" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Evidencia (opcional)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label htmlFor="complaint-evidence" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                        <span>Subir archivo</span>
                        <input id="complaint-evidence" name="evidence" type="file" className="sr-only" onChange={handleFileUpload} accept=".jpg,.jpeg,.png,.pdf,.mp4,.avi" />
                      </label>
                      <p className="pl-1">o arrastra y suelta</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, PDF, MP4, AVI hasta 10MB
                    </p>
                    {complaintForm.evidence && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        Archivo seleccionado: {complaintForm.evidence.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Información importante:</h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Todas las denuncias son tratadas con confidencialidad</li>
                  <li>• Se realizará una investigación imparcial</li>
                  <li>• Recibirás seguimiento del caso en un plazo máximo de 5 días hábiles</li>
                  <li>• Las denuncias falsas pueden tener consecuencias legales</li>
                </ul>
              </div>

              <div>
                <button type="submit" className="w-full bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  Enviar Denuncia
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* PQRSDF */}
      <div role="tabpanel" id="panel-pqrsdf" aria-labelledby="tab-pqrsdf" hidden={activeTab !== "pqrsdf"}>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-2">
                PQRSDF - Peticiones, Quejas, Reclamos, Sugerencias, Denuncias y Felicitaciones
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Tu opinión es importante para nosotros. Comparte tus comentarios, sugerencias o reclamos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulario PQRSDF">
              <div>
                <label htmlFor="pqrsdf-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de solicitud</label>
                <select id="pqrsdf-type" name="type" required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={pqrsdfForm.type} onChange={handlePqrsdfChange} aria-required="true">
                  <option value="">Seleccione el tipo</option>
                  <option value="peticion">Petición</option>
                  <option value="queja">Queja</option>
                  <option value="reclamo">Reclamo</option>
                  <option value="sugerencia">Sugerencia</option>
                  <option value="denuncia">Denuncia</option>
                  <option value="felicitacion">Felicitación</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="pqrsdf-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre completo</label>
                  <input type="text" id="pqrsdf-name" name="name" required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={pqrsdfForm.name} onChange={handlePqrsdfChange} aria-required="true" />
                </div>
                <div>
                  <label htmlFor="pqrsdf-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de identificación</label>
                  <input type="text" id="pqrsdf-id" name="idNumber" required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={pqrsdfForm.idNumber} onChange={handlePqrsdfChange} aria-required="true" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="pqrsdf-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo electrónico</label>
                  <input 
                    type="email" 
                    id="pqrsdf-email" 
                    name="email" 
                    required 
                    className={`mt-1 block w-full border ${pqrsdfEmailValidation.error ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white`}
                    value={pqrsdfForm.email} 
                    onChange={handlePqrsdfChange} 
                    aria-required="true" 
                  />
                  {pqrsdfEmailValidation.error && (
                    <p className="mt-1 text-sm text-red-600">{pqrsdfEmailValidation.error}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="pqrsdf-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                  <input 
                    type="tel" 
                    id="pqrsdf-phone" 
                    name="phone" 
                    className={`mt-1 block w-full border ${pqrsdfPhoneValidation.error ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white`}
                    value={pqrsdfForm.phone} 
                    onChange={handlePqrsdfChange} 
                  />
                  {pqrsdfPhoneValidation.error && (
                    <p className="mt-1 text-sm text-red-600">{pqrsdfPhoneValidation.error}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="pqrsdf-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asunto</label>
                <input type="text" id="pqrsdf-subject" name="subject" required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={pqrsdfForm.subject} onChange={handlePqrsdfChange} aria-required="true" />
              </div>

              <div>
                <label htmlFor="pqrsdf-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                <textarea id="pqrsdf-description" name="description" rows={5} required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" placeholder="Describe tu solicitud de manera clara y detallada..." value={pqrsdfForm.description} onChange={handlePqrsdfChange} aria-required="true"></textarea>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Tiempo de respuesta:</h4>
                <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                  <li>• <strong>Peticiones:</strong> 15 días hábiles</li>
                  <li>• <strong>Quejas y Reclamos:</strong> 15 días hábiles</li>
                  <li>• <strong>Sugerencias:</strong> 30 días hábiles</li>
                  <li>• <strong>Denuncias:</strong> 5 días hábiles</li>
                  <li>• <strong>Felicitaciones:</strong> 5 días hábiles</li>
                </ul>
              </div>

              <div>
                <button type="submit" className="w-full bg-slate-950 dark:bg-green-500 text-white py-3 px-6 rounded-md hover:bg-opacity-90 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400">
                  Enviar PQRSDF
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
