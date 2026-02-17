"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* --- LOGO MEJORADO --- */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Imagen del Logo con efecto */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-valora-green transition-all duration-300 shadow-sm">
               <img src="/logo.png" alt="Logo" className="w-full h-full object-contain bg-white" />
            </div>
            
            {/* Texto Estilizado */}
            <div className="flex flex-col leading-none">
                <span className="font-black text-xl text-valora-navy tracking-tighter group-hover:text-valora-green transition-colors">
                    VALORA
                </span>
                <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase group-hover:text-valora-green transition-colors">
                    VISSIÓN
                </span>
            </div>
          </Link>

          {/* Menú Desktop */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="text-gray-600 hover:text-valora-green font-medium transition">Inicio</Link>
            <Link href="/citas" className="text-gray-600 hover:text-valora-green font-medium transition">Citas</Link>
            <Link href="/#servicios" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-valora-green hover:bg-gray-50">Servicios</Link>
            
            <Link href="/login" className="bg-valora-navy text-white px-5 py-2.5 rounded-full font-bold hover:bg-valora-green hover:text-valora-navy transition shadow-lg shadow-valora-navy/20 flex items-center gap-2 text-sm">
              <User size={16} /> Acceso Staff
            </Link>
          </div>

          {/* Botón Menú Móvil */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-valora-green transition p-2">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil (Desplegable) */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-xl animate-fade-in-down">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <Link href="/" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-valora-green hover:bg-gray-50">Inicio</Link>
            <Link href="/citas" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-valora-green hover:bg-gray-50">Agendar Cita</Link>
            <Link href="/#servicios" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-valora-green hover:bg-gray-50">Servicios</Link>
            <div className="border-t border-gray-100 my-2 pt-2">
                <Link href="/login" onClick={() => setIsOpen(false)} className="w-full text-center block bg-valora-navy text-white px-3 py-3 rounded-lg font-bold">
                    Acceso Administrativo
                </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}