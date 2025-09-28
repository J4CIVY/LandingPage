'use client';

import { useState, useRef } from 'react';
import { FaImage, FaTimes, FaSpinner, FaPaperPlane } from 'react-icons/fa';
import { Publicacion, FormularioPublicacion, EstadoCarga } from '@/types/comunidad';

interface PublicacionFormProps {
  onPublicar: (publicacion: Publicacion) => void;
  onCancelar: () => void;
  grupoId?: string | null;
}

export default function PublicacionForm({
  onPublicar,
  onCancelar,
  grupoId
}: PublicacionFormProps) {
  const [formulario, setFormulario] = useState<FormularioPublicacion>({
    contenido: '',
    imagenes: [],
    grupoId: grupoId || undefined
  });
  
  const [previsualizaciones, setPrevisualizaciones] = useState<string[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>({
    cargando: false,
    error: null,
    exito: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Función para manejar cambios en el contenido
  const manejarCambioContenido = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const valor = e.target.value;
    setFormulario(prev => ({ ...prev, contenido: valor }));
    
    // Auto-resize del textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Función para manejar selección de imágenes
  const manejarSeleccionImagenes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(e.target.files || []);
    const imagenesValidas = archivos.filter(archivo => 
      archivo.type.startsWith('image/') && archivo.size <= 5 * 1024 * 1024 // 5MB máximo
    );

    if (imagenesValidas.length !== archivos.length) {
      setEstado(prev => ({ 
        ...prev, 
        error: 'Algunos archivos no son válidos. Solo se permiten imágenes menores a 5MB.' 
      }));
      setTimeout(() => setEstado(prev => ({ ...prev, error: null })), 3000);
    }

    // Actualizar formulario
    setFormulario(prev => ({
      ...prev,
      imagenes: [...prev.imagenes, ...imagenesValidas].slice(0, 4) // Máximo 4 imágenes
    }));

    // Crear previsualizaciones
    imagenesValidas.forEach(imagen => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPrevisualizaciones(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(imagen);
    });

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Función para eliminar imagen
  const eliminarImagen = (indice: number) => {
    setFormulario(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== indice)
    }));
    setPrevisualizaciones(prev => prev.filter((_, i) => i !== indice));
  };

  // Función para enviar publicación
  const enviarPublicacion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formulario.contenido.trim()) {
      setEstado(prev => ({ ...prev, error: 'El contenido es obligatorio' }));
      return;
    }

    setEstado({ cargando: true, error: null, exito: false });

    try {
      const formData = new FormData();
      formData.append('contenido', formulario.contenido);
      
      if (formulario.grupoId) {
        formData.append('grupoId', formulario.grupoId);
      }

      // Agregar imágenes
      formulario.imagenes.forEach((imagen, indice) => {
        formData.append(`imagen_${indice}`, imagen);
      });

      const response = await fetch('/api/comunidad/publicaciones', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        onPublicar(data.datos);
        setEstado({ cargando: false, error: null, exito: true });
        
        // Limpiar formulario
        setFormulario({ contenido: '', imagenes: [], grupoId: grupoId || undefined });
        setPrevisualizaciones([]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al crear la publicación');
      }
    } catch (error) {
      console.error('Error:', error);
      setEstado({
        cargando: false,
        error: error instanceof Error ? error.message : 'Error al crear la publicación',
        exito: false
      });
    }
  };

  return (
  <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {grupoId ? 'Nueva publicación en grupo' : 'Nueva publicación'}
        </h3>
        <button
          onClick={onCancelar}
          className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

  <form onSubmit={enviarPublicacion} className="space-y-4">
        {/* Error */}
        {estado.error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3">
            <p className="text-red-600 dark:text-red-200 text-sm">{estado.error}</p>
          </div>
        )}

        {/* Textarea para contenido */}
        <div>
          <label htmlFor="contenido" className="sr-only">
            Contenido de la publicación
          </label>
          <textarea
            ref={textareaRef}
            id="contenido"
            value={formulario.contenido}
            onChange={manejarCambioContenido}
            placeholder="¿Qué quieres compartir con la comunidad?"
            className="w-full min-h-[120px] p-4 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
            maxLength={5000}
            disabled={estado.cargando}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-300">
              {formulario.contenido.length}/5000 caracteres
            </span>
          </div>
        </div>

        {/* Vista previa de imágenes */}
        {previsualizaciones.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Imágenes seleccionadas ({previsualizaciones.length}/4)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {previsualizaciones.map((preview, indice) => (
                <div key={indice} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${indice + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => eliminarImagen(indice)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 dark:bg-red-800"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones de acción */}
  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            {/* Botón agregar imágenes */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={formulario.imagenes.length >= 4 || estado.cargando}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaImage className="h-4 w-4" />
              <span className="text-sm">
                {formulario.imagenes.length > 0 ? 'Más imágenes' : 'Agregar imágenes'}
              </span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={manejarSeleccionImagenes}
              className="hidden"
            />

            {formulario.imagenes.length > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-300">
                {4 - formulario.imagenes.length} restantes
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onCancelar}
              disabled={estado.cargando}
              className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formulario.contenido.trim() || estado.cargando}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {estado.cargando ? (
                <FaSpinner className="h-4 w-4 animate-spin" />
              ) : (
                <FaPaperPlane className="h-4 w-4" />
              )}
              <span>{estado.cargando ? 'Publicando...' : 'Publicar'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}