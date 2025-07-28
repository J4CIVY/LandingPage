export const colombianMunicipalities = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Pereira"];
export const genderIdentities = ["Hombre Cisgénero", "Mujer Cisgénero", "Hombre Trans", "Mujer Trans", "No Binario", "Género Fluido", "Agénero"];
export const occupations = ["Empleado", "Independiente / Freelancer", "Estudiante", "Empresario", "Desempleado", "Hogar", "Pensionado"];
export const disciplines = ["Abogado", "Ingeniero", "Médico", "Artista", "Diseñador", "Contador", "Profesor", "Consultor"];
export const colombianEPS = ["Sura", "Sanitas", "Compensar", "Nueva EPS", "Salud Total", "Coomeva", "Aliansalud"];
export const motorcycleBrands = ["Honda", "Yamaha", "Suzuki", "Kawasaki", "KTM", "Bajaj", "TVS", "Royal Enfield", "Ducati", "BMW Motorrad"];

export const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 2000; year--) {
    years.push(year.toString());
  }
  return years;
};
