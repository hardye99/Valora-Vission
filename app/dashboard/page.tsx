"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Calendar, FileText, LogOut, Search, Eye, Plus, User, CheckCircle, XCircle, Phone, Clock } from "lucide-react";
import ExamForm from "@/components/ExamForm";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("citas"); 
  const [showExamForm, setShowExamForm] = useState(false);
  const [showApptForm, setShowApptForm] = useState(false); // Modal para nueva cita
  const [selectedExam, setSelectedExam] = useState<any>(null);
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estado para formulario de nueva cita manual
  const [newAppt, setNewAppt] = useState({
    client_name: "", client_phone: "", date: "", time: "", reason: "Examen de la Vista"
  });
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login");
      else fetchData();
    };
    checkUser();
  }, []);

  const fetchData = async () => {
    // Citas: Ordenadas por fecha (las más nuevas al final o principio según preferencia)
    const { data: citas } = await supabase.from("appointments").select("*").order("date_time", { ascending: true });
    if (citas) setAppointments(citas);

    const { data: recetas } = await supabase.from("prescriptions").select("*").order("created_at", { ascending: false });
    if (recetas) setPrescriptions(recetas);
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // --- LÓGICA DE CITAS ---

  // 1. Cambiar Estatus (Completada / Cancelada)
  const updateStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase.from("appointments").update({ status: newStatus }).eq("id", id);
    if (error) alert("Error al actualizar");
    else fetchData(); // Recargar lista
  };

  // 2. Crear Cita Manual
  const handleCreateAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newAppt.date || !newAppt.time) return alert("Selecciona fecha y hora");
    
    const dateTime = new Date(`${newAppt.date}T${newAppt.time}:00`);
    
    const { error } = await supabase.from("appointments").insert([{
        client_name: newAppt.client_name,
        client_phone: newAppt.client_phone,
        date_time: dateTime.toISOString(),
        status: "pendiente",
        reason: newAppt.reason
    }]);

    if(error) alert("Error: " + error.message);
    else {
        alert("Cita Agendada ✅");
        setShowApptForm(false);
        setNewAppt({ client_name: "", client_phone: "", date: "", time: "", reason: "Examen de la Vista" });
        fetchData();
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => p.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const timeSlots = ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00"];

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 text-valora-navy font-bold animate-pulse">Cargando sistema...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <nav className="bg-valora-navy text-white px-4 md:px-6 py-4 shadow-lg flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2"><Eye className="text-valora-green" /><span className="font-bold text-lg md:text-xl tracking-tight">Panel <span className="text-valora-green">Valora</span></span></div>
        <div className="flex bg-black/20 rounded-lg p-1 text-xs md:text-sm font-medium">
            <button onClick={() => {setActiveTab("citas"); setShowExamForm(false)}} className={`px-4 py-1.5 rounded-md transition ${activeTab === "citas" ? "bg-white text-valora-navy shadow-sm" : "text-gray-300 hover:text-white"}`}>Citas</button>
            <button onClick={() => {setActiveTab("examenes"); setShowExamForm(false)}} className={`px-4 py-1.5 rounded-md transition ${activeTab === "examenes" ? "bg-white text-valora-navy shadow-sm" : "text-gray-300 hover:text-white"}`}>Exámenes</button>
        </div>
        <button onClick={handleLogout} className="text-red-200 hover:text-white p-2 rounded-full hover:bg-white/10 transition"><LogOut size={20} /></button>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* --- PESTAÑA DE CITAS --- */}
        {activeTab === "citas" && (
            <div className="space-y-6 animate-fade-in-up">
                <header className="flex justify-between items-center border-b pb-4 bg-white p-4 rounded-xl shadow-sm">
                    <div><h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Calendar className="text-valora-green"/> Agenda</h2><p className="text-gray-500 text-sm">Administra tus citas</p></div>
                    <button onClick={() => setShowApptForm(true)} className="bg-valora-navy text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow hover:bg-valora-green hover:text-valora-navy transition text-sm">
                        <Plus size={18} /> Agendar Cita
                    </button>
                </header>

                {/* FORMULARIO MODAL PARA NUEVA CITA */}
                {showApptForm && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-valora-navy mb-4">Nueva Cita Manual</h3>
                            <form onSubmit={handleCreateAppt} className="space-y-4">
                                <input required placeholder="Nombre del Cliente" className="w-full p-2 border rounded" value={newAppt.client_name} onChange={e => setNewAppt({...newAppt, client_name: e.target.value})} />
                                <input required placeholder="Teléfono" className="w-full p-2 border rounded" value={newAppt.client_phone} onChange={e => setNewAppt({...newAppt, client_phone: e.target.value})} />
                                <div className="grid grid-cols-2 gap-2">
                                    <input required type="date" className="p-2 border rounded" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                                    <select required className="p-2 border rounded" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})}>
                                        <option value="">Hora...</option>
                                        {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-2 justify-end mt-4">
                                    <button type="button" onClick={() => setShowApptForm(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancelar</button>
                                    <button type="submit" className="px-4 py-2 bg-valora-navy text-white rounded font-bold hover:bg-valora-green">Agendar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {appointments.length === 0 ? <p className="col-span-full bg-white p-8 rounded-xl text-center text-gray-400 border border-dashed border-gray-300">No hay citas pendientes.</p> : 
                        appointments.map((appt) => {
                            // Definir estilos según status
                            let statusColor = "bg-yellow-100 text-yellow-700 border-yellow-200";
                            let opacity = "opacity-100";
                            if (appt.status === "completada") { statusColor = "bg-green-100 text-green-700 border-green-200"; }
                            if (appt.status === "cancelada") { statusColor = "bg-gray-100 text-gray-500 border-gray-200"; opacity = "opacity-60"; }

                            return (
                                <div key={appt.id} className={`bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition relative group ${opacity} ${appt.status === 'cancelada' ? 'border-gray-200' : 'border-gray-100'}`}>
                                    {/* Indicador lateral de color */}
                                    <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-xl ${appt.status === 'completada' ? 'bg-green-500' : appt.status === 'cancelada' ? 'bg-gray-400' : 'bg-yellow-400'}`}></div>
                                    
                                    <div className="flex justify-between items-start mb-3 pl-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{appt.client_name}</h3>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-1 text-sm text-gray-600 pl-2 mb-4">
                                        <p className="flex items-center gap-2"><Calendar size={14} className="text-valora-navy"/> {new Date(appt.date_time).toLocaleDateString()}</p>
                                        <p className="flex items-center gap-2"><Clock size={14} className="text-valora-navy"/> {new Date(appt.date_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        <p className="flex items-center gap-2"><Phone size={14} className="text-valora-navy"/> {appt.client_phone}</p>
                                    </div>

                                    {/* BOTONES DE ACCIÓN (Solo si está pendiente) */}
                                    {appt.status === "pendiente" && (
                                        <div className="flex gap-2 pt-3 border-t border-gray-100 pl-2">
                                            <button onClick={() => updateStatus(appt.id, "completada")} className="flex-1 bg-green-50 text-green-700 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100 flex justify-center items-center gap-1 transition">
                                                <CheckCircle size={14}/> Completar
                                            </button>
                                            <button onClick={() => updateStatus(appt.id, "cancelada")} className="flex-1 bg-red-50 text-red-700 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 flex justify-center items-center gap-1 transition">
                                                <XCircle size={14}/> Cancelar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        )}

        {/* --- PESTAÑA DE EXÁMENES --- */}
        {activeTab === "examenes" && (
            <div className="space-y-6 animate-fade-in-up">
                {showExamForm ? (
                    <ExamForm initialData={selectedExam} onSuccess={() => {setShowExamForm(false); fetchData();}} onCancel={() => setShowExamForm(false)} />
                ) : (
                    <>
                        <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <div><h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FileText className="text-valora-green"/> Historial</h2></div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64"><Search className="absolute left-3 top-3 text-gray-400" size={18} /><input type="text" placeholder="Buscar paciente..." className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-valora-green/50" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
                                <button onClick={() => {setSelectedExam(null); setShowExamForm(true);}} className="bg-valora-navy text-white px-5 py-2.5 rounded-lg font-bold shadow hover:bg-valora-green hover:text-valora-navy transition flex items-center gap-2"><Plus size={20}/> <span className="hidden md:inline">Nuevo Examen</span></button>
                            </div>
                        </header>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider hidden md:table-header-group border-b">
                                    <tr>
                                        <th className="p-4">Paciente</th>
                                        <th className="p-4 text-center">RX Resumen</th>
                                        <th className="p-4">Material</th>
                                        <th className="p-4 text-right">Ver</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredPrescriptions.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-gray-400">No se encontraron pacientes.</td></tr> : 
                                        filteredPrescriptions.map((p) => (
                                            <tr key={p.id} onClick={() => {setSelectedExam(p); setShowExamForm(true);}} className="hover:bg-blue-50/50 cursor-pointer transition group">
                                                <td className="p-4">
                                                    <div className="font-bold text-valora-navy text-base">{p.patient_name}</div>
                                                    <div className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</div>
                                                </td>
                                                <td className="p-4 text-center hidden md:table-cell">
                                                    <div className="text-xs font-mono bg-gray-100 rounded p-2 inline-block text-left">
                                                        <div className="text-blue-600">OD: {p.sph_od} / {p.cyl_od} x {p.axis_od}</div>
                                                        <div className="text-green-600">OI: {p.sph_oi} / {p.cyl_oi} x {p.axis_oi}</div>
                                                        {p.add_power && <div className="text-gray-500 font-bold border-t border-gray-300 mt-1 pt-1">ADD: {p.add_power}</div>}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600 hidden md:table-cell">
                                                    {p.material_final ? <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100 uppercase">{p.material_final}</span> : <span className="text-gray-300 italic">--</span>}
                                                </td>
                                                <td className="p-4 text-right"><span className="text-valora-green font-bold text-sm group-hover:underline flex items-center justify-end gap-1"><Eye size={16}/></span></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        )}
      </main>
    </div>
  );
}