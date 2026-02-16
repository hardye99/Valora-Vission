"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import Link from "next/link"; // <--- Importante
import { Lock, Mail, ArrowLeft } from "lucide-react"; // <--- Agregamos ArrowLeft

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-valora-light px-4 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute top-0 left-0 w-full h-64 bg-valora-navy rounded-b-[50px] shadow-2xl"></div>

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl relative z-10">
        
        {/* BOTÓN DE REGRESAR */}
        <div className="absolute top-6 left-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-gray-400 hover:text-valora-green transition font-medium text-sm group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/>
            Volver al Inicio
          </Link>
        </div>

        <div className="text-center flex flex-col items-center mt-6">
          {/* LOGO EN EL LOGIN */}
          <div className="relative w-48 h-24 mb-4">
            <Image 
              src="/logo.png" 
              alt="Valora Vissión" 
              fill 
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Acceso Administrativo</h2>
          <p className="mt-2 text-sm text-gray-500">Ingresa tus credenciales para gestionar.</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-valora-green">
                <Mail size={20} />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-valora-navy focus:border-transparent outline-none transition bg-gray-50"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-valora-green">
                <Lock size={20} />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-valora-navy focus:border-transparent outline-none transition bg-gray-50"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-valora-navy hover:bg-valora-green transition-all shadow-lg transform hover:scale-[1.02]"
          >
            {loading ? "Verificando..." : "Entrar al Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}