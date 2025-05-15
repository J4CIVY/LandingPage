import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EventosDashboard = () => {
  const [eventos, setEventos] = useState([]);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    lugar: '',
    imagen: '',
  });
  const [editando, setEditando] = useState(null);

  const token = localStorage.getItem('token'); // Asegúrate de guardar el JWT

  const obtenerEventos = async () => {
    try {
      const res = await axios.get('/api/eventos');
      setEventos(res.data);
    } catch (err) {
      console.error('Error al obtener eventos', err);
    }
  };

  useEffect(() => {
    obtenerEventos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editando) {
        await axios.put(`/api/eventos/${editando}`, form, config);
      } else {
        await axios.post('/api/eventos', form, config);
      }

      setForm({ titulo: '', descripcion: '', fecha: '', lugar: '', imagen: '' });
      setEditando(null);
      obtenerEventos();
    } catch (err) {
      console.error('Error al guardar evento', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/eventos/${id}`, config);
      obtenerEventos();
    } catch (err) {
      console.error('Error al eliminar evento', err);
    }
  };

  const handleEdit = (evento) => {
    setForm({
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      fecha: evento.fecha.slice(0, 10),
      lugar: evento.lugar,
      imagen: evento.imagen,
    });
    setEditando(evento._id);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{editando ? 'Editar Evento' : 'Nuevo Evento'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-100 p-4 rounded-lg shadow">
        <input type="text" placeholder="Título" value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="w-full p-2" />
        <textarea placeholder="Descripción" value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full p-2" />
        <input type="date" value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="w-full p-2" />
        <input type="text" placeholder="Lugar" value={form.lugar}
          onChange={(e) => setForm({ ...form, lugar: e.target.value })} className="w-full p-2" />
        <input type="text" placeholder="URL de imagen" value={form.imagen}
          onChange={(e) => setForm({ ...form, imagen: e.target.value })} className="w-full p-2" />
        <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded">
          {editando ? 'Actualizar Evento' : 'Crear Evento'}
        </button>
      </form>

      <h2 className="text-xl font-semibold mt-10 mb-2">Lista de Eventos</h2>
      <ul className="space-y-2">
        {eventos.map(evento => (
          <li key={evento._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <h3 className="font-bold">{evento.titulo}</h3>
              <p>{new Date(evento.fecha).toLocaleDateString()}</p>
              <p>{evento.lugar}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(evento)} className="text-blue-600">Editar</button>
              <button onClick={() => handleDelete(evento._id)} className="text-red-600">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventosDashboard;
