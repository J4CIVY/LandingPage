'use client';

import { Mensaje, MensajeTipo } from '@/types/pqrsdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { 
  FaPaperPlane, 
  FaUser, 
  FaCog, 
  FaUserTie, 
  FaPaperclip,
  FaDownload 
} from 'react-icons/fa';

interface ChatBoxProps {
  mensajes: Mensaje[];
  onEnviarMensaje?: (contenido: string, adjuntos?: File[]) => Promise<void>;
  puedeResponder?: boolean;
  className?: string;
}

const ICONOS_TIPO: Record<MensajeTipo, { icon: React.ComponentType<any>, color: string }> = {
  usuario: { icon: FaUser, color: 'bg-blue-600' },
  admin: { icon: FaUserTie, color: 'bg-green-600' },
  sistema: { icon: FaCog, color: 'bg-gray-600' }
};

export default function ChatBox({ 
  mensajes, 
  onEnviarMensaje, 
  puedeResponder = false,
  className = '' 
}: ChatBoxProps) {
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [adjuntos, setAdjuntos] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);

  // Ordenar mensajes por fecha (más antiguo primero)
  const mensajesOrdenados = [...mensajes].sort((a, b) => 
    a.fechaCreacion.getTime() - b.fechaCreacion.getTime()
  );

  const handleEnviar = async () => {
    if (!nuevoMensaje.trim() || !onEnviarMensaje || enviando) return;

    setEnviando(true);
    try {
      await onEnviarMensaje(nuevoMensaje.trim(), adjuntos);
      setNuevoMensaje('');
      setAdjuntos([]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setEnviando(false);
    }
  };

  const handleAdjuntos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(e.target.files || []);
    setAdjuntos(prev => [...prev, ...archivos]);
  };

  const removerAdjunto = (index: number) => {
    setAdjuntos(prev => prev.filter((_, i) => i !== index));
  };

  const formatearTamaño = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const tamaños = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamaños[i];
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          Conversación
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {mensajes.length} mensaje{mensajes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Mensajes */}
      <div className="flex-1 p-4 space-y-4 max-h-96 overflow-y-auto">
        {mensajesOrdenados.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-slate-400 py-8">
            <FaCog className="w-8 h-8 mx-auto mb-2" />
            <p>No hay mensajes aún</p>
          </div>
        ) : (
          mensajesOrdenados.map((mensaje) => {
            const { icon: IconComponent, color } = ICONOS_TIPO[mensaje.tipo];
            const esUsuario = mensaje.tipo === 'usuario';
            
            return (
              <div key={mensaje.id} className={`flex ${esUsuario ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${esUsuario ? 'order-2' : 'order-1'}`}>
                  <div className={`rounded-lg p-3 ${
                    esUsuario 
                      ? 'bg-blue-600 text-white' 
                      : mensaje.tipo === 'sistema'
                        ? 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-100'
                        : 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                  }`}>
                    {/* Header del mensaje */}
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${esUsuario ? 'bg-blue-500' : color}`}>
                        <IconComponent className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-medium opacity-90">
                        {mensaje.autorNombre}
                      </span>
                      <span className="text-xs opacity-70">
                        {format(mensaje.fechaCreacion, 'dd/MM/yyyy HH:mm', { locale: es })}
                      </span>
                    </div>
                    
                    {/* Contenido */}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {mensaje.contenido}
                    </p>
                    
                    {/* Adjuntos */}
                    {mensaje.adjuntos && mensaje.adjuntos.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {mensaje.adjuntos.map((adjunto) => (
                          <div key={adjunto.id} className="flex items-center space-x-2 text-xs opacity-90">
                            <FaPaperclip className="w-3 h-3" />
                            <span>{adjunto.nombre}</span>
                            <span>({formatearTamaño(adjunto.tamaño)})</span>
                            <a 
                              href={adjunto.url} 
                              download 
                              className="hover:underline"
                            >
                              <FaDownload className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input para nuevo mensaje */}
      {puedeResponder && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          {/* Adjuntos seleccionados */}
          {adjuntos.length > 0 && (
            <div className="mb-3 space-y-1">
              {adjuntos.map((archivo, index) => (
                <div key={index} className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-700 p-2 rounded">
                  <div className="flex items-center space-x-2">
                    <FaPaperclip className="w-3 h-3" />
                    <span>{archivo.name}</span>
                    <span>({formatearTamaño(archivo.size)})</span>
                  </div>
                  <button
                    onClick={() => removerAdjunto(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                rows={3}
                disabled={enviando}
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              {/* Botón adjuntar */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleAdjuntos}
                  className="hidden"
                  disabled={enviando}
                />
                <div className="p-3 text-gray-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                  <FaPaperclip className="w-4 h-4" />
                </div>
              </label>
              
              {/* Botón enviar */}
              <button
                onClick={handleEnviar}
                disabled={!nuevoMensaje.trim() || enviando}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <FaPaperPlane className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}