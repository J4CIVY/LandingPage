export const colombianMunicipalities = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"];
export const genderIdentities = ["Masculino", "Femenino", "No binario", "Prefiero no decir", "Otro"];
export const occupations = ["Estudiante", "Empleado", "Independiente", "Desempleado", "Hogar", "Jubilado"];
export const disciplines = ["Velocidad", "Turismo", "Off-road", "Stunt", "Urbano"];
export const colombianEPS = ["Sura", "Coomeva", "Sanitas", "Compensar", "Nueva EPS", "Famisanar"];
export const motorcycleBrands = ["Yamaha", "Honda", "Suzuki", "Kawasaki", "BMW", "Ducati", "Harley-Davidson", "KTM"];
export const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= 1950; i--) {
    years.push(i.toString());
  }
  return years;
};
