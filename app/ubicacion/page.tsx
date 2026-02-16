import Navbar from "@/components/Navbar";
import Link from "next/link";
import { MapPin, Clock, Navigation } from "lucide-react";

export default function LocationPage() {
  // Dirección exacta para sincronizar mapa y botón
  const mapQuery = "Mercado+El+Campesino,+Cantarranas,+Guadalajara";

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-valora-navy text-center mb-4">
          Visítanos en Guadalajara
        </h1>
        <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
          Estamos ubicados dentro del Mercado del Campesino, listos para atenderte con la mejor tecnología.
        </p>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: INFORMACIÓN */}
          <div className="space-y-6">
            
            {/* Tarjeta Dirección */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-valora-green">
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-xl text-valora-navy">
                  <MapPin size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-valora-navy mb-1">Dirección Exacta</h3>
                  <p className="text-lg font-medium text-gray-800">Mercado del Campesino</p>
                  <p className="text-gray-600 mb-3">Calle Cantarranas, Guadalajara, Jal.</p>
                  <div className="inline-block bg-valora-navy text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">
                    Manzana 17, Local 11 y 12
                  </div>
                  <p className="text-xs text-gray-400 mt-4 italic">
                    *Tip: Entrando por el pasillo principal, busca el letrero verde de Valora Vissión.
                  </p>
                </div>
              </div>
            </div>

            {/* Tarjeta Horario */}
            <div className="bg-valora-navy text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-valora-green rounded-full blur-[60px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="bg-white/10 p-3 rounded-xl text-valora-green">
                  <Clock size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Horario de Atención</h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between w-full border-b border-white/10 pb-2">
                      <span className="text-gray-300">Lunes a Sábado</span>
                      <span className="font-bold text-valora-green">9:30 AM - 3:30 PM</span>
                    </div>
                    <div className="flex justify-between w-full pt-2">
                      <span className="text-gray-300">Domingo</span>
                      <span className="font-bold text-red-300">Cerrado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÓN SINCRONIZADO: Abre la app en el mismo lugar */}
            <Link 
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full bg-valora-green text-valora-navy font-bold py-4 rounded-xl shadow-lg hover:bg-white border-2 border-valora-green transition-all flex items-center justify-center gap-3 text-lg"
            >
              <Navigation className="group-hover:scale-110 transition-transform" />
              Abrir en Google Maps
            </Link>

          </div>

          {/* COLUMNA DERECHA: MAPA SINCRONIZADO */}
          <div className="bg-white p-2 rounded-3xl shadow-xl h-[500px] border border-gray-200 overflow-hidden relative">
             <iframe 
               width="100%" 
               height="100%" 
               id="gmap_canvas" 
               // Usamos la misma variable 'mapQuery' para asegurar que sea idéntico
               src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=17&ie=UTF8&iwloc=&output=embed`}
               frameBorder="0" 
               scrolling="no" 
               style={{ border: 0, borderRadius: "1rem" }}
               allowFullScreen
               title="Mapa Mercado"
             ></iframe>
          </div>

        </div>
      </div>
    </div>
  );
}