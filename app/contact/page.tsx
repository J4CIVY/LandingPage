'use client';

import React, { useState, useCallback } from "react";
import SEOComponent from '@/components/home/SEOComponent';

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

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

const Contact: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("general");
  const [anonymousComplaint, setAnonymousComplaint] = useState<boolean>(false);

  const [contactForm, setContactForm] = useState<ContactFormState>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [complaintForm, setComplaintForm] = useState<ComplaintFormState>({
    title: "",
    description: "",
    location: "",
    date: "",
    evidence: null
  });

  const [pqrsdfForm, setPqrsdfForm] = useState<PqrsdfFormState>({
    type: "peticion",
    name: "",
    idNumber: "",
    email: "",
    phone: "",
    subject: "",
    description: ""
  });

  const handleContactChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleComplaintChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setComplaintForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePqrsdfChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPqrsdfForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de archivo no permitido. Por favor, sube PNG, JPG o PDF.');
        e.target.value = '';
        setComplaintForm(prev => ({ ...prev, evidence: null }));
        return;
      }

      if (file.size > maxSize) {
        alert('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
        e.target.value = '';
        setComplaintForm(prev => ({ ...prev, evidence: null }));
        return;
      }

      setComplaintForm(prev => ({ ...prev, evidence: file }));
    }
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let formDataToSend: ContactFormState | (ComplaintFormState & { anonymous: boolean }) | PqrsdfFormState = {} as any;
    let formName = "";

    switch (activeTab) {
      case "general":
        formDataToSend = contactForm;
        formName = "Contacto General";
        break;
      case "complaint":
        formDataToSend = { ...complaintForm, anonymous: anonymousComplaint };
        formName = "Denuncia Anónima";
        break;
      case "pqrsdf":
        formDataToSend = pqrsdfForm;
        formName = "PQRSDF";
        break;
      default:
        break;
    }

    console.log(`Formulario de ${formName} enviado:`, formDataToSend);
    alert(`Formulario de ${formName} enviado con éxito.`);

    setContactForm({ name: "", email: "", phone: "", subject: "", message: "" });
    setComplaintForm({ title: "", description: "", location: "", date: "", evidence: null });
    setPqrsdfForm({ type: "peticion", name: "", idNumber: "", email: "", phone: "", subject: "", description: "" });
    setAnonymousComplaint(false);
  }, [activeTab, contactForm, complaintForm, pqrsdfForm, anonymousComplaint]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SEOComponent
        title="Contacto - BSK Motorcycle Team"
        description="Contacta con la comunidad BSK. Únete a nuestra familia sobre ruedas, encuentra información de contacto, envía un mensaje o conoce cómo podemos ayudarte en tu aventura motera."
      />
      <section className="bg-white dark:bg-slate-950 text-slate-950 dark:text-white py-16 px-4 md:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Contacta a la Comunidad BSK</h1>
          <p className="text-xl md:text-2xl text-green-400">
            Estamos aquí para recibirte en nuestra familia sobre ruedas
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="flex flex-wrap border-b border-gray-200 dark:border-slate-600" role="tablist">
          {[
            { id: "general", label: "Información General" },
            { id: "complaint", label: "Denuncias Anónimas" },
            { id: "pqrsdf", label: "PQRSDF" },
            { id: "locations", label: "Ubicaciones" }
          ].map(tab => (
            <button
              key={tab.id}
              className={`py-4 px-6 font-medium text-sm md:text-base ${
                activeTab === tab.id 
                  ? "text-green-400 border-b-2 border-green-400" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div role="tabpanel" id="panel-general" aria-labelledby="tab-general" hidden={activeTab !== "general"}>
          {activeTab === "general" && (
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-6">Datos de Contacto</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Dirección
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Carrera 5 A No. 36 A Sur 28<br />CP 110431, Bogotá D.C.<br />Colombia</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      Teléfonos
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2"><strong>Administrativo:</strong> <a href="tel:+573125192000" className="text-blue-600 dark:text-blue-400 hover:underline">312 5192000</a><br /><strong>Operativo (24/7):</strong> <a href="tel:+573125192000" className="text-blue-600 dark:text-blue-400 hover:underline">312 5192000</a><br /><strong>WhatsApp:</strong> <a href="https://wa.me/573125192000" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">312 5192000</a></p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Correos Electrónicos
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2"><strong>Institucional:</strong> <a href="mailto:contacto@bskmt.xyz" className="text-blue-600 dark:text-blue-400 hover:underline">contacto@bskmt.xyz</a><br /><strong>Notificaciones judiciales:</strong> <a href="mailto:notificacionesjudiciales@bskmt.xyz" className="text-blue-600 dark:text-blue-400 hover:underline">notificacionesjudiciales@bskmt.xyz</a><br /><strong>Correspondencia:</strong> <a href="mailto:correspondencia@bskmt.xyz" className="text-blue-600 dark:text-blue-400 hover:underline">correspondencia@bskmt.xyz</a></p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Horarios de Atención
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2"><strong>Administrativo:</strong><br />Lunes a Viernes: 8:00 AM - 5:00 PM<br />Sábados: 8:00 AM - 1:00 PM<br /><strong>Operativo:</strong> 24/7 todos los días</p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-6">Formulario de Contacto</h2>
                <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulario de Contacto General">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre completo</label>
                    <input type="text" id="contact-name" name="name" required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={contactForm.name} onChange={handleContactChange} aria-required="true" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo electrónico</label>
                      <input type="email" id="contact-email" name="email" required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={contactForm.email} onChange={handleContactChange} aria-required="true" />
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                      <input type="tel" id="contact-phone" name="phone" className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={contactForm.phone} onChange={handleContactChange} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asunto</label>
                    <select id="contact-subject" name="subject" required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={contactForm.subject} onChange={handleContactChange} aria-required="true">
                      <option value="">Seleccione un asunto</option>
                      <option value="membership">Membresías</option>
                      <option value="events">Eventos</option>
                      <option value="courses">Cursos</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mensaje</label>
                    <textarea id="contact-message" name="message" rows={4} required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={contactForm.message} onChange={handleContactChange} aria-required="true"></textarea>
                  </div>
                  <div>
                    <button type="submit" className="w-full bg-slate-950 dark:bg-green-500 text-white py-3 px-6 rounded-md hover:bg-opacity-90 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition">Enviar Mensaje</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        <div role="tabpanel" id="panel-complaint" aria-labelledby="tab-complaint" hidden={activeTab !== "complaint"}>
          {activeTab === "complaint" && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-8" role="alert">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-300"><strong>Importante:</strong> Las denuncias falsas pueden tener consecuencias legales. Por favor proporcione información veraz.</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulario de Denuncias Anónimas">
                <div className="flex items-center">
                  <input type="checkbox" id="anonymous" name="anonymous" className="h-4 w-4 text-green-400 focus:ring-green-400 border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800" checked={anonymousComplaint} onChange={() => setAnonymousComplaint(!anonymousComplaint)} />
                  <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Deseo hacer esta denuncia de forma anónima</label>
                </div>
                {!anonymousComplaint && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="complainant-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                      <input type="text" id="complainant-name" name="complainant-name" className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" />
                    </div>
                    <div>
                      <label htmlFor="complainant-contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contacto (opcional)</label>
                      <input type="text" id="complainant-contact" name="complainant-contact" className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" />
                    </div>
                  </div>
                )}
                <div>
                  <label htmlFor="complaint-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título de la denuncia</label>
                  <input type="text" id="complaint-title" name="title" required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={complaintForm.title} onChange={handleComplaintChange} aria-required="true" />
                </div>
                <div>
                  <label htmlFor="complaint-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción detallada</label>
                  <textarea id="complaint-description" name="description" rows={6} required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={complaintForm.description} onChange={handleComplaintChange} aria-required="true"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="complaint-location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lugar de los hechos</label>
                    <input type="text" id="complaint-location" name="location" required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={complaintForm.location} onChange={handleComplaintChange} aria-required="true" />
                  </div>
                  <div>
                    <label htmlFor="complaint-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha aproximada</label>
                    <input type="date" id="complaint-date" name="date" required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={complaintForm.date} onChange={handleComplaintChange} aria-required="true" />
                  </div>
                </div>
                <div>
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Evidencia (fotos, videos, documentos)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-md bg-gray-50 dark:bg-slate-800">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-green-400 hover:text-green-600 focus-within:outline-none">
                          <span>Subir archivo</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept=".png,.jpg,.jpeg,.pdf" />
                        </label>
                        <p className="pl-1">o arrastrar y soltar</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, PDF hasta 10MB</p>
                    </div>
                  </div>
                  {complaintForm.evidence && (<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Archivo seleccionado: {complaintForm.evidence.name}</p>)}
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="complaint-terms" name="terms" type="checkbox" required className="focus:ring-green-400 h-4 w-4 text-green-400 border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800" aria-required="true" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="complaint-terms" className="font-medium text-gray-700 dark:text-gray-300">Acepto que la información proporcionada es veraz y me hago responsable de su contenido</label>
                  </div>
                </div>
                <div>
                  <button type="submit" className="w-full bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition">Enviar Denuncia</button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div role="tabpanel" id="panel-pqrsdf" aria-labelledby="tab-pqrsdf" hidden={activeTab !== "pqrsdf"}>
          {activeTab === "pqrsdf" && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 mb-8" role="alert">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700 dark:text-blue-300"><strong>Nota:</strong> Todos los PQRSDF requieren identificación del solicitante para dar trámite según la ley 1755 de 2015.</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulario de PQRSDF">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de solicitud</label>
                  <div className="mt-1 grid grid-cols-2 md:grid-cols-3 gap-3" role="radiogroup" aria-labelledby="pqrsdf-type-label">
                    {[
                      { value: "peticion", label: "Petición" },
                      { value: "queja", label: "Queja" },
                      { value: "reclamo", label: "Reclamo" },
                      { value: "sugerencia", label: "Sugerencia" },
                      { value: "denuncia", label: "Denuncia" },
                      { value: "felicitacion", label: "Felicitación" }
                    ].map((option) => (
                      <div key={option.value} className="flex items-center">
                        <input id={`pqrsdf-${option.value}`} name="type" type="radio" value={option.value} checked={pqrsdfForm.type === option.value} onChange={handlePqrsdfChange} className="focus:ring-green-400 h-4 w-4 text-green-400 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800" />
                        <label htmlFor={`pqrsdf-${option.value}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">{option.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="pqrsdf-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre completo*</label>
                    <input type="text" id="pqrsdf-name" name="name" required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={pqrsdfForm.name} onChange={handlePqrsdfChange} aria-required="true" />
                  </div>
                  <div>
                    <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de identificación*</label>
                    <input type="text" id="idNumber" name="idNumber" required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={pqrsdfForm.idNumber} onChange={handlePqrsdfChange} aria-required="true" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="pqrsdf-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo electrónico*</label>
                    <input type="email" id="pqrsdf-email" name="email" required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={pqrsdfForm.email} onChange={handlePqrsdfChange} aria-required="true" />
                  </div>
                  <div>
                    <label htmlFor="pqrsdf-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono*</label>
                    <input type="tel" id="pqrsdf-phone" name="phone" required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={pqrsdfForm.phone} onChange={handlePqrsdfChange} aria-required="true" />
                  </div>
                </div>
                <div>
                  <label htmlFor="pqrsdf-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asunto*</label>
                  <input type="text" id="pqrsdf-subject" name="subject" required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={pqrsdfForm.subject} onChange={handlePqrsdfChange} aria-required="true" />
                </div>
                <div>
                  <label htmlFor="pqrsdf-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción detallada*</label>
                  <textarea id="pqrsdf-description" name="description" rows={6} required className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-400 focus:border-green-400 bg-white dark:bg-slate-800 text-slate-950 dark:text-white" value={pqrsdfForm.description} onChange={handlePqrsdfChange} aria-required="true"></textarea>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="pqrsdf-terms" name="pqrsdf-terms" type="checkbox" required className="focus:ring-green-400 h-4 w-4 text-green-400 border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800" aria-required="true" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="pqrsdf-terms" className="font-medium text-gray-700 dark:text-gray-300">Autorizo el tratamiento de mis datos personales según la ley 1581 de 2012 y política de privacidad de BSK Motorcycle Team</label>
                  </div>
                </div>
                <div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">Enviar PQRSDF</button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div role="tabpanel" id="panel-locations" aria-labelledby="tab-locations" hidden={activeTab !== "locations"}>
          {activeTab === "locations" && (
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-6">Nuestras Sedes</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">Sede Principal Bogotá</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Carrera 5 A No. 36 A Sur 28<br />Bogotá D.C., Colombia</p>
                  <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3977.026942599596!2d-74.1210588852382!3d4.590179996663901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f99a0f0f0f0f1%3A0x0!2zNMKwMzUnMjQuNiJOIDc0wrAwNycxNS44Ilc!5e0!3m2!1ses!2sco!4v1620000000000!5m2!1ses!2sco"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      title="Ubicación Sede Principal Bogotá"
                    ></iframe>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">Próximamente Nuevas Sedes</h3>
                  <p className="text-gray-600 dark:text-gray-400">Estamos trabajando para expandir nuestra presencia. ¡Mantente atento a nuestras próximas aperturas!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
