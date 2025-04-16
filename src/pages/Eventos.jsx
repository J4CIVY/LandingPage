import Card from "../components/shared/Card";

const Eventos = () => {
  return (
    <section className="md:p-8 p-4">
      {/* Título de la sección */}
      <div className="flex items-center justify-between mb-16">
        <h2 className="text-xl text-[#000031]">Eventos del Club</h2>
        <button className="flex items-center gap-4 text-[#ffffff] bg-[#000031] py-2 px-4 rounded-lg">
          <span>Filtrar</span>
        </button>
      </div>

      {/* Grid de Cards */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
        {/* Puedes copiar/pegar más <Card /> si quieres */}
        <Card
          img="comida.png"
          description="Rodada a Villavicencio"
          price="Gratis"
          inventory="30 cupos"
        />
        <Card
          img="dish.png"
          description="Tour del Café"
          price="$120.000"
          inventory="20 cupos"
        />
        <Card
          img="comida.png"
          description="Tatacoa BSK"
          price="$150.000"
          inventory="15 cupos"
        />
      </div>
    </section>
  );
};

export default Eventos;
