import { useState } from "react";
import {
    MdOutlineEmail,
    MdLockOutline,
    MdOutlineSportsMotorsports
} from "react-icons/md";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulamos un delay de red (1 segundo)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Validación local (ejemplo básico)
    if (email === "admin@bsk.com" && password === "123456") {
      console.log("Login exitoso. Redirigiendo...");
      // Mock: Guardamos un token ficticio en localStorage
      localStorage.setItem("token", "mock-token-123");
      window.location.href = "/"; // Redirigir al home (cambia esto por navigate si usas react-router)
    } else {
      setError("Credenciales incorrectas. Usa admin@bsk.com / 123456 para probar.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000031] p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header del Login */}
        <div className="bg-[#FF0000] p-4 text-center">
          <MdOutlineSportsMotorsports className="inline-block text-4xl text-white" />
          <h2 className="text-2xl font-bold text-white mt-2">BSK MOTORCYCLE TEAM</h2>
          <p className="text-white">Ingresa a tu cuenta</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3">
              <p>{error}</p>
            </div>
          )}

          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <div className="relative">
              <MdOutlineEmail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
                placeholder="admin@bsk.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Contraseña</label>
            <div className="relative">
              <MdLockOutline className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
                placeholder="123456"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#FF0000] hover:bg-[#CC0000] text-white font-bold py-2 px-4 rounded transition duration-200 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Cargando..." : "Iniciar Sesión"}
          </button>

          <div className="text-center">
            <Link to="/register" className="text-[#000031] hover:underline">
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;