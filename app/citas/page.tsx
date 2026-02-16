"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { Calendar, Clock, MapPin, Phone, CheckCircle, User } from "lucide-react";

export default function BookingPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  // DATOS DEL FORMULARIO
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    reason: "Examen de la Vista"
  });

  // GENERAR HORARIOS (9:30 AM a 3:30 PM)
  const timeSlots = [
    "09:30", "10:00", "10:30", "11:00", "11:30", 
    "12:00", "12:30", "13:00", "13:30", 
    "14:00", "14:30", "15:00", "15:30"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.time || !formData.date) {
      alert("Por favor selecciona fecha y hora");
      return;
    }
    setLoading(true);

    // Combinar fecha y hora en formato ISO
    const dateTime = new Date(`${formData.date}T${formData.time}:00`);

    const { error } = await supabase.from("appointments").insert([
      {
        client_name: formData.name,
        client_phone: formData.phone,
        date_time: dateTime.toISOString(),
        status: "pendiente",
        reason: formData.reason
      }
    ]);

    setLoading(false);

    if (error) {
      alert("Error al agendar: " + error.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-valora-navy text-center mb-2">Agenda tu Visita</h1>
        <p className="text-center text-gray-500 mb-10">Elige el horario que mejor te acomode. ¡Te esperamos!</p>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* COLUMNA IZQUIERDA: INFORMACIÓN Y UBICACIÓN */}
          <div className="space-y-6">
            {/* Tarjeta de Ubicación */}
            <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-valora-green">
              <h3 className="font-bold text-xl text-valora-navy flex items-center gap-2 mb-4">
                <MapPin className="text-valora-green" /> Ubicación
              </h3>
              <p className="font-medium text-gray-800 text-lg">Mercado del Campesino</p>
              <p className="text-gray-600">Guadalajara, Jalisco</p>
              <div className="mt-3 bg-blue-50 text-valora-navy px-4 py-2 rounded-lg inline-block font-bold border border-blue-100">
                Manzana 17, Local 11 y 12
              </div>
              <p className="text-xs text-gray-400 mt-4">
                *Referencia: Dentro del mercado, pasillo principal.
              </p>
            </div>

            {/* Tarjeta de Horario */}
            <div className="bg-valora-navy text-white p-6 rounded-2xl shadow-md">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-2">
                <Clock className="text-valora-green" /> Horario de Atención
              </h3>
              <p className="text-gray-300">Lunes a Sábado</p>
              <p className="text-2xl font-bold text-valora-green">9:30 AM - 3:30 PM</p>
            </div>
          </div>

          {/* COLUMNA DERECHA: FORMULARIO */}
          <div className="bg-white p-8 rounded-3xl shadow-xl">
            {success ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold text-valora-navy">¡Cita Confirmada!</h2>
                <p className="text-gray-600 mt-2">Te esperamos en el local 11 y 12.</p>
                <button 
                  onClick={() => {setSuccess(false); setFormData({...formData, name:"", phone:"", date:"", time:""})}}
                  className="mt-6 text-valora-green font-bold hover:underline"
                >
                  Agendar otra cita
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tu Nombre</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input required type="text" placeholder="Ej. Juan Pérez"
                      className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-valora-green outline-none"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input required type="tel" placeholder="Ej. 33 1234 5678"
                      className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-valora-green outline-none"
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fecha</label>
                    <input required type="date"
                      min={new Date().toISOString().split("T")[0]} // No permite fechas pasadas
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-valora-green outline-none"
                      value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Hora</label>
                    <select required
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-valora-green outline-none bg-white"
                      value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                    >
                      <option value="">Seleccionar...</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button disabled={loading} className="w-full bg-valora-navy text-white font-bold py-4 rounded-xl hover:bg-valora-green transition shadow-lg mt-4">
                  {loading ? "Agendando..." : "Confirmar Cita"}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}