"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Calendar, FileText, LogOut, Plus, Search, User } from "lucide-react";
import ExamForm from "@/components/ExamForm"; // Importamos el formulario nuevo

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("citas"); // 'citas' o 'examenes'
  const [showExamForm, setShowExamForm] = useState(false);
  
  // Datos
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
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
    // Cargar Citas
    const { data: citas } = await supabase.from("appointments").select("*").order("date_time", { ascending: true });
    if (citas) setAppointments(citas);

    // Cargar Exámenes (Recetas)
    const { data: recetas } = await supabase.from("prescriptions").select("*").order("created_at", { ascending: false });
    if (recetas) setPrescriptions(recetas);
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-valora-navy">Cargando Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-valora-navy text-white px-6 py-4 shadow-md flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <span className="font-bold text-xl tracking-wide">Panel <span className="text-valora-green">Valora</span></span>
            <div className="flex bg-black/20 rounded-lg p-1 text-sm">
                <button onClick={() => {setActiveTab("citas"); setShowExamForm(false)}} className={`px-4 py-1 rounded-md transition ${activeTab === "citas" ? "bg-white text-valora-navy font-bold" : "text-gray-300 hover:text-white"}`}>Citas</button>
                <button onClick={() => setActiveTab("examenes")} className={`px-4 py-1 rounded-md transition ${activeTab === "examenes" ? "bg-white text-valora-navy font-bold" : "text-gray-300 hover:text-white"}`}>Exámenes</button>
            </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 hover:text-red-300 text-sm font-medium"><LogOut size={18} /> Salir</button>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        
        {/* VISTA DE CITAS */}
        {activeTab === "citas" && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Calendar className="text-valora-green"/> Agenda de Citas</h2>
                    <button className="bg-valora-navy text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-opacity-90">+ Nueva Cita</button>
                </div>

                <div className="grid gap-4">
                    {appointments.length === 0 ? <p className="text-gray-500 bg-white p-6 rounded-lg text-center">No hay citas pendientes.</p> : 
                    appointments.map((appt) => (
                        <div key={appt.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-valora-green flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg">{appt.client_name}</h3>
                                <p className="text-gray-500 text-sm">{new Date(appt.date_time).toLocaleString()}</p>
                            </div>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">{appt.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* VISTA DE EXÁMENES / GRADUACIONES */}
        {activeTab === "examenes" && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FileText className="text-valora-green"/> Historial Clínico</h2>
                    {!showExamForm && (
                        <button onClick={() => setShowExamForm(true)} className="bg-valora-green text-valora-navy px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-white transition">
                            + Nueva Graduación
                        </button>
                    )}
                </div>

                {/* Si mostramos el formulario o la lista */}
                {showExamForm ? (
                    <ExamForm onSuccess={() => {setShowExamForm(false); fetchData();}} onCancel={() => setShowExamForm(false)} />
                ) : (
                    <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                                <tr>
                                    <th className="p-4">Paciente</th>
                                    <th className="p-4 text-center">OD (Esf)</th>
                                    <th className="p-4 text-center">OI (Esf)</th>
                                    <th className="p-4">Fecha</th>
                                    <th className="p-4">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {prescriptions.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-gray-500">No hay exámenes registrados.</td></tr> :
                                prescriptions.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-bold text-valora-navy">{p.patient_name}</td>
                                        <td className="p-4 text-center font-mono text-blue-600">{p.sph_od}</td>
                                        <td className="p-4 text-center font-mono text-green-600">{p.sph_oi}</td>
                                        <td className="p-4 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                                        <td className="p-4"><button className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">Ver PDF</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )}

      </main>
    </div>
  );
}