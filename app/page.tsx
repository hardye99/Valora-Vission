import Navbar from "@/components/Navbar";
import Link from "next/link";
import { CheckCircle, Clock, MapPin, ShieldCheck, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-valora-light text-slate-800 font-sans">
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="relative w-full bg-gradient-to-br from-[#1B2A49] via-[#263457] to-[#0F1A30] text-white overflow-hidden py-24 lg:py-32 px-4 flex items-center min-h-[85vh]">
        
        {/* Círculo decorativo verde detrás */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#92C02E] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <span className="text-[#92C02E] font-bold tracking-widest text-sm uppercase bg-white/10 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
              Salud Visual Integral
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
              Conoce el valor <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#92C02E] to-[#F39200]">
                de tu visión
              </span>
            </h1>
            <p className="text-xl text-gray-200 max-w-lg leading-relaxed font-light">
              Tecnología de vanguardia para tu diagnóstico y las mejores marcas de armazones que definen tu estilo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/citas" className="bg-[#92C02E] text-[#1B2A49] font-bold px-8 py-4 rounded-full hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(146,192,46,0.3)] text-center flex items-center justify-center gap-2">
                Agendar Examen <ArrowRight size={20} />
              </Link>
              
              {/* BOTÓN VER UBICACIÓN ACTUALIZADO */}
              <Link 
                href="/ubicacion" // <--- Ahora lleva a tu nueva página
                className="border border-white/30 text-white px-8 py-4 rounded-full hover:bg-white/10 hover:border-white transition-all font-medium flex items-center justify-center gap-2"
              >
                <MapPin size={20} /> Ver Ubicación
              </Link>
            </div>
          </div>
          
          {/* Tarjeta Flotante Derecha */}
          <div className="relative h-[450px] bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-center p-8 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 hidden md:flex">
             {/* Brillo del lente */}
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
             
             <div className="text-center z-10">
               <div className="w-24 h-24 bg-[#1B2A49] rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-[#92C02E] shadow-xl">
                 <span className="text-4xl">👓</span>
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">Estrena Lentes Hoy</h3>
               <p className="text-white/60 mb-6">Armazones completos desde $899</p>
               <div className="bg-[#92C02E] text-[#1B2A49] px-6 py-2 rounded-lg font-bold inline-block shadow-lg">
                 20% DE DESCUENTO
               </div>
               <p className="mt-4 text-xs text-white/40">*En tu primera compra</p>
             </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#1B2A49]">Nuestros Servicios</h2>
          <p className="text-gray-500 mt-2">Cuidamos cada detalle de tu visión con profesionalismo</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "Examen GRATIS", text: "Sabemos la importancia de tener salud visual." },
            { icon: Clock, title: "Entrega Express", text: "Entendemos tu prisa. Contamos con laboratorio propio para entregar tus lentes en tiempo récord." },
            { icon: MapPin, title: "Atención Personalizada", text: "Asesores expertos dedicados a encontrar el armazón perfecto para tu tipo de rostro y estilo de vida." },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-lg shadow-gray-200/50 hover:-translate-y-1 transition duration-300 border-b-4 border-[#92C02E]">
              <div className="w-14 h-14 bg-[#F4F7FA] rounded-xl flex items-center justify-center mb-6">
                <item.icon className="w-8 h-8 text-[#1B2A49]" />
              </div>
              <h3 className="text-xl font-bold text-[#1B2A49] mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1B2A49] text-white py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-10 text-center md:text-left">
          
          <div>
             <h3 className="text-xl font-bold mb-4 flex items-center justify-center md:justify-start gap-2">
                Valora Vissión
             </h3>
             <p className="text-gray-400 text-sm leading-relaxed">
               Comprometidos con tu salud visual. Ofrecemos exámenes de la vista gratis, lentes de contacto y una amplia variedad de armazones.
             </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#92C02E] mb-4">Ubicación</h3>
            <p className="text-gray-300 text-sm mb-1">Mercado del Campesino</p>
            <div className="bg-white/10 px-3 py-1 rounded inline-block mb-1">
              <p className="text-white text-sm font-medium">Manzana 17, Local 11 y 12</p>
            </div>
            <p className="text-gray-300 text-sm">Guadalajara, Jalisco.</p>
          </div>

          <div>
             <h3 className="text-lg font-bold text-[#92C02E] mb-4">Horario</h3>
             <p className="text-gray-300 text-sm mb-2">Lunes a Domingo</p>
             <p className="text-white font-bold text-2xl">9:30 AM - 3:30 PM</p>
             <p className="text-xs text-gray-500 mt-2">Jueves Cerrado</p>
          </div>

        </div>
        <div className="text-center mt-12 pt-8 border-t border-white/5 text-xs text-gray-500">
          © 2026 Valora Vissión Óptica. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}