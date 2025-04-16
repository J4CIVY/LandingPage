import React from "react";
import Header from "../components/shared/Header";

const Events = ({ showMenu }) => {
  const upcomingEvents = [
    {
      id: 1,
      title: "Noche de Parrilla",
      date: "15 Octubre 2023",
      description: "Evento especial con carnes premium y vinos seleccionados",
      image: "/event-grill.jpg"
    },
    {
      id: 2,
      title: "Festival de Cócteles",
      date: "22 Octubre 2023",
      description: "Degustación de cócteles exclusivos con mixólogos expertos",
      image: "/event-cocktails.jpg"
    },
    {
      id: 3,
      title: "Cena de Vinos",
      date: "29 Octubre 2023",
      description: "Maridaje perfecto entre nuestros platos y los mejores vinos",
      image: "/event-wine.jpg"
    }
  ];

  return (
    <div className={`py-2 px-4 transition-all duration-300 ${
      showMenu ? "ml-28" : "ml-0"
    }`}>
      <Header showMenu={showMenu} />
      
      {/* Contenido principal de eventos */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#000031] mb-4">
            Próximos Eventos
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestras experiencias gastronómicas exclusivas
          </p>
        </div>

        {/* Listado de eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-200">
                {/* Imagen del evento - reemplazar con tu componente Image */}
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#000031] mb-2">
                  {event.title}
                </h3>
                <p className="text-[#00ff99] font-medium mb-3">{event.date}</p>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <button className="bg-[#000031] text-white py-2 px-6 rounded-lg hover:bg-opacity-90 transition">
                  Más información
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Events;