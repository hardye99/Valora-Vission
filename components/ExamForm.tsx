"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Save, Eye, X } from "lucide-react";

export default function ExamForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  
  // Estado para los datos del examen
  const [formData, setFormData] = useState({
    patient_name: "",
    sph_od: "0.00", cyl_od: "0.00", axis_od: "0",
    sph_oi: "0.00", cyl_oi: "0.00", axis_oi: "0",
    add_power: "0.00",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Obtenemos el usuario actual (Staff/Admin)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Debes iniciar sesión");
      return;
    }

    const { error } = await supabase.from("prescriptions").insert([{
      ...formData,
      created_by: user.id
    }]);

    setLoading(false);
    if (error) alert("Error: " + error.message);
    else {
      alert("✅ Graduación guardada correctamente");
      onSuccess();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-valora-green">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-valora-navy flex items-center gap-2">
          <Eye className="text-valora-green" /> Nuevo Examen Visual
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-red-500"><X /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre Paciente */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Paciente</label>
          <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-valora-navy outline-none"
            value={formData.patient_name} onChange={e => setFormData({...formData, patient_name: e.target.value})} placeholder="Nombre completo" />
        </div>

        {/* TABLA DE GRADUACIÓN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* OJO DERECHO (OD) */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold text-valora-navy mb-3 border-b border-blue-200 pb-1">OJO DERECHO (OD)</h4>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-xs font-bold text-gray-500">ESFERA</label><input type="number" step="0.25" className="w-full border p-1 rounded text-center" value={formData.sph_od} onChange={e => setFormData({...formData, sph_od: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-gray-500">CILINDRO</label><input type="number" step="0.25" className="w-full border p-1 rounded text-center" value={formData.cyl_od} onChange={e => setFormData({...formData, cyl_od: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-gray-500">EJE</label><input type="number" className="w-full border p-1 rounded text-center" value={formData.axis_od} onChange={e => setFormData({...formData, axis_od: e.target.value})} /></div>
            </div>
          </div>

          {/* OJO IZQUIERDO (OI) */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-bold text-valora-navy mb-3 border-b border-green-200 pb-1">OJO IZQUIERDO (OI)</h4>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-xs font-bold text-gray-500">ESFERA</label><input type="number" step="0.25" className="w-full border p-1 rounded text-center" value={formData.sph_oi} onChange={e => setFormData({...formData, sph_oi: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-gray-500">CILINDRO</label><input type="number" step="0.25" className="w-full border p-1 rounded text-center" value={formData.cyl_oi} onChange={e => setFormData({...formData, cyl_oi: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-gray-500">EJE</label><input type="number" className="w-full border p-1 rounded text-center" value={formData.axis_oi} onChange={e => setFormData({...formData, axis_oi: e.target.value})} /></div>
            </div>
          </div>
        </div>

        {/* Adición y Notas */}
        <div className="flex gap-4">
            <div className="w-1/3">
                <label className="block text-sm font-bold text-gray-700">ADICIÓN (ADD)</label>
                <input type="number" step="0.25" className="w-full border p-2 rounded" value={formData.add_power} onChange={e => setFormData({...formData, add_power: e.target.value})} />
            </div>
            <div className="w-2/3">
                <label className="block text-sm font-bold text-gray-700">Notas / Diagnóstico</label>
                <input type="text" className="w-full border p-2 rounded" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Ej. Vista cansada, requiere antireflejante..." />
            </div>
        </div>

        <button disabled={loading} className="w-full bg-valora-navy text-white py-3 rounded-lg font-bold hover:bg-valora-green transition flex justify-center gap-2">
          {loading ? "Guardando..." : <><Save size={20} /> Guardar Expediente</>}
        </button>
      </form>
    </div>
  );
}