import React from "react";

const Testimonials: React.FC = () => (
  <div className="mt-16">
    <h3 className="text-2xl font-semibold text-slate-950 mb-8 text-center">TESTIMONIOS DE MIEMBROS</h3>
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex items-center mb-6">
          {/* Ensure alt text is descriptive for accessibility */}
          <img src="/member1.webp" alt="Retrato de Carlos Méndez, miembro del club" className="w-16 h-16 rounded-full mr-6" loading="lazy" />
          <div>
            <h4 className="text-xl font-bold text-slate-950">Carlos Méndez</h4>
            <p className="text-green-400">Miembro desde 2024</p>
          </div>
        </div>
        <p className="text-gray-700 italic">"La asistencia en carretera que ofrece el club me dio tranquilidad en mi último viaje largo. Saber que tenía apoyo en caso de emergencia hizo toda la diferencia."</p>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex items-center mb-6">
          {/* Ensure alt text is descriptive for accessibility */}
          <img src="/member2.webp" alt="Retrato de Laura Torres, miembro del club" className="w-16 h-16 rounded-full mr-6" loading="lazy" />
          <div>
            <h4 className="text-xl font-bold text-slate-950">Laura Torres</h4>
            <p className="text-green-400">Miembro desde 2022</p>
          </div>
        </div>
        <p className="text-gray-700 italic">"Los descuentos en repuestos y talleres ya han cubierto el costo de mi membresía varias veces. Además, la comunidad es increíble, he hecho amigos para toda la vida."</p>
      </div>
    </div>
  </div>
);

export default Testimonials;