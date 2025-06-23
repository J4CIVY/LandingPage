import { useState } from 'react';
import { MdOutlineEmail, MdLockOutline, MdOutlineSportsMotorsports } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login({ email, password }); // Usa el método del AuthContext
      // No necesitas redirigir manualmente, el AuthContext ya lo hace
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Error al iniciar sesión. Por favor intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
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
                placeholder="usuario@bskmt.com"
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
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#FF0000] hover:bg-[#CC0000] text-white font-bold py-2 px-4 rounded transition duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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