"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Importante para mostrar tu logo
import { Menu, X, UserCircle } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          
          {/* LOGO REAL */}
          <Link href="/" className="flex items-center gap-3">
            {/* Ajusta el width/height si quieres que sea más grande o chico */}
            <div className="relative w-40 h-16">
               <Image 
                 src="/logo.png" 
                 alt="Valora Vissión Logo" 
                 fill
                 className="object-contain" // Esto asegura que el logo no se deforme
                 priority
               />
            </div>
          </Link>

          {/* MENÚ PC */}
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-600">
            <Link href="/" className="hover:text-valora-green transition font-semibold">Inicio</Link>
            <Link href="#servicios" className="hover:text-valora-green transition font-semibold">Servicios</Link>
            
            <Link href="/login" className="flex items-center gap-1 hover:text-valora-navy transition font-semibold">
              <UserCircle size={20}/> Staff
            </Link>

            <Link 
              href="/citas" 
              className="bg-valora-navy text-white px-6 py-3 rounded-full hover:bg-valora-green transition shadow-lg shadow-valora-navy/20 font-bold tracking-wide"
            >
              Agendar Cita
            </Link>
          </div>

          {/* BOTÓN MÓVIL */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-valora-navy p-2">
              {isOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-xl p-6 flex flex-col gap-6 z-50">
          <Link href="/" onClick={() => setIsOpen(false)} className="text-xl text-valora-navy font-bold">Inicio</Link>
          <Link href="#servicios" onClick={() => setIsOpen(false)} className="text-xl text-valora-navy font-bold">Servicios</Link>
          <Link href="/login" onClick={() => setIsOpen(false)} className="text-xl text-valora-navy font-bold flex items-center gap-2">
            <UserCircle size={24}/> Acceso Personal
          </Link>
          <Link href="/citas" onClick={() => setIsOpen(false)} className="bg-valora-green text-white text-center py-4 rounded-xl font-bold text-lg shadow-md">
            Agendar Cita
          </Link>
        </div>
      )}
    </nav>
  );
}