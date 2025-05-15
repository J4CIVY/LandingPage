import React, { useEffect, useState } from "react";
import axios from "axios";

const Events = () => {
  const [eventosFuturos, setEventosFuturos] = useState([]);
  const [eventosPasados, setEventosPasados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [selectedTab, setSelectedTab] = useState("futuros");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLugar, setFilterLugar] = useState("todos");
  const [orderByFecha, setOrderByFecha] = useState("asc");


  useEffect(() => {
    const obtenerEventos = async () => {
      try {
        const res = await axios.get("/api/eventos");
        const hoy = new Date();

        const futuros = [];
        const pasados = [];

        res.data.forEach((evento) => {
          const fechaEvento = new Date(evento.fecha);
          if (fechaEvento >= hoy) {
            futuros.push(evento);
          } else {
            pasados.push(evento);
          }
        });

        setEventosFuturos(
          futuros.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        );
        setEventosPasados(
          pasados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        );
      } catch (error) {
        console.error("Error al obtener eventos:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerEventos();
  }, []);

  const renderEvento = (evento) => (
    <div
      key={evento._id}
      className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="h-48 bg-gray-200">
        <img
          src={evento.imagen}
          alt={evento.titulo}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-[#000031] mb-2">
          {evento.titulo}
        </h3>
        <p className="text-[#00ff99] font-medium mb-1">
          {new Date(evento.fecha).toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="text-sm text-gray-600 italic mb-2">{evento.lugar}</p>
        <p className="text-gray-700 mb-4">{evento.descripcion}</p>
        <button className="bg-[#000031] text-white py-2 px-6 rounded-lg hover:bg-opacity-90 transition">
          Más información
        </button>
      </div>
    </div>
  );

  const eventosBase = selectedTab === "futuros" ? eventosFuturos : eventosPasados;

  const lugaresUnicos = ["todos", ...new Set(eventosBase.map((e) => e.lugar))];

  const eventosFiltrados = eventosBase.filter((evento) => {
    const coincideTitulo = evento.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const coincideLugar = filterLugar === "todos" || evento.lugar === filterLugar;
    return coincideTitulo && coincideLugar;
  });

  return (
    <div className="min-h-screen bg-white">
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#000031] mb-4">
            Eventos del BSK Motorcycle Team
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explora nuestros eventos futuros y revive los momentos pasados.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={() => setSelectedTab("futuros")}
            className={`py-2 px-6 rounded-full border ${selectedTab === "futuros"
              ? "bg-[#000031] text-white border-[#000031]"
              : "bg-white text-[#000031] border-gray-300"
              } transition`}
          >
            Próximos Eventos
          </button>
          <button
            onClick={() => setSelectedTab("pasados")}
            className={`py-2 px-6 rounded-full border ${selectedTab === "pasados"
              ? "bg-[#000031] text-white border-[#000031]"
              : "bg-white text-[#000031] border-gray-300"
              } transition`}
          >
            Eventos Pasados
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#000031]"
          />
          <select
            value={filterLugar}
            onChange={(e) => setFilterLugar(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#000031]"
          >
            {lugaresUnicos.map((lugar, idx) => (
              <option key={idx} value={lugar}>
                {lugar.charAt(0).toUpperCase() + lugar.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={orderByFecha}
            onChange={(e) => setOrderByFecha(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#000031]"
          >
            <option value="asc">Más cercanos primero</option>
            <option value="desc">Más lejanos primero</option>
          </select>

        </div>

        {/* Resultados */}
        {cargando ? (
          <p className="text-center text-gray-500">Cargando eventos...</p>
        ) : eventosFiltrados.length === 0 ? (
          <p className="text-center text-gray-500">
            No hay resultados para tu búsqueda.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventosFiltrados.sort((a, b) =>
              orderByFecha === "asc"
                ? new Date(a.fecha) - new Date(b.fecha)
                : new Date(b.fecha) - new Date(a.fecha)
            )
              .map(renderEvento)}
          </div>
        )}
      </section>
    </div>
  );
};

export default Events;
