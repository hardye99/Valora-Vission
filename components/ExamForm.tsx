"use client";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Eye, Printer, X, Pencil, Save, Ban } from "lucide-react";

interface ExamData {
  id?: number;
  patient_name: string;
  address: string;
  phone: string;
  age: string;
  occupation: string;
  last_exam_date: string;
  
  history_hypertension: boolean; history_hypotension: boolean; condition_controlled: boolean;
  history_diabetes: boolean; history_diabetes_controlled: boolean; history_headache: boolean;
  history_eye_accident: boolean; history_tearing: boolean; history_burning: boolean; history_itching: boolean;

  av_od: string; av_oi: string; dip: string; ao_height: string;

  prev_sph_od: string; prev_cyl_od: string; prev_axis_od: string; prev_add_od: string;
  prev_sph_oi: string; prev_cyl_oi: string; prev_axis_oi: string; prev_add_oi: string;

  sph_od: string; cyl_od: string; axis_od: string; add_power: string;
  sph_oi: string; cyl_oi: string; axis_oi: string;

  lens_type: string[]; lens_material: string[];
  is_tinte: boolean; tone: string; antiblue: boolean; material_final: string;
}

interface ExamFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any; 
}

export default function ExamForm({ onSuccess, onCancel, initialData }: ExamFormProps) {
  const [loading, setLoading] = useState(false);
  // ESTADO DE EDICIÓN: Si hay datos iniciales, empezamos en FALSE (Lectura), si no, en TRUE (Creación)
  const [isEditing, setIsEditing] = useState(!initialData);
  
  const supabase = createClient();
  const printRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<ExamData>({
    patient_name: "", address: "", phone: "", age: "", occupation: "", 
    last_exam_date: new Date().toISOString().split('T')[0],
    
    history_hypertension: false, history_hypotension: false, condition_controlled: false,
    history_diabetes: false, history_diabetes_controlled: false, history_headache: false,
    history_eye_accident: false, history_tearing: false, history_burning: false, history_itching: false,

    av_od: "", av_oi: "", dip: "", ao_height: "",

    prev_sph_od: "", prev_cyl_od: "", prev_axis_od: "", prev_add_od: "",
    prev_sph_oi: "", prev_cyl_oi: "", prev_axis_oi: "", prev_add_oi: "",

    sph_od: "", cyl_od: "", axis_od: "", add_power: "",
    sph_oi: "", cyl_oi: "", axis_oi: "", 

    lens_type: [], lens_material: [],
    is_tinte: false, tone: "", antiblue: false, material_final: ""
  });

  useEffect(() => {
    if (initialData) {
      const typeArray = initialData.lens_type ? initialData.lens_type.split(", ") : [];
      const matArray = initialData.lens_material ? initialData.lens_material.split(", ") : [];

      const cleanData = Object.fromEntries(
        Object.entries(initialData).map(([key, val]) => [key, val === null ? "" : val])
      );

      setFormData({ 
        ...cleanData, 
        lens_type: typeArray, 
        lens_material: matArray,
        antiblue: initialData.material_final?.includes("Antiblue") || false,
        is_tinte: initialData.material_final?.includes("Tinte") || false,
      } as ExamData);
      
      // Aseguramos que empiece en modo lectura si cargamos datos
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [initialData]);

  const getMaterialSummary = () => {
    const parts = [
      ...formData.lens_type,
      ...formData.lens_material,
      formData.antiblue ? "Antiblue" : "",
      formData.is_tinte ? `Tinte ${formData.tone}` : ""
    ];
    return parts.filter(p => p && p.trim() !== "").join(" + ");
  };

  const handleAxis = (e: React.ChangeEvent<HTMLInputElement>, field: keyof ExamData) => {
    if(!isEditing) return;
    const val = e.target.value;
    if (val === "" || (/^\d+$/.test(val) && parseInt(val) >= 0 && parseInt(val) <= 180)) {
        setFormData(prev => ({ ...prev, [field]: val }));
    }
  };

  const handleDiopterChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof ExamData) => {
    if(!isEditing) return;
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleDiopterBlur = (e: React.FocusEvent<HTMLInputElement>, field: keyof ExamData) => {
    if(!isEditing) return;
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
        const rounded = (Math.round(val * 4) / 4).toFixed(2);
        const finalVal = (field.includes('add') && parseFloat(rounded) > 0 && !rounded.startsWith('+')) ? `+${rounded}` : rounded;
        setFormData(prev => ({ ...prev, [field]: finalVal }));
    }
  };

  const handleInt = (e: React.ChangeEvent<HTMLInputElement>, field: keyof ExamData) => {
    if(!isEditing) return;
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleCheck = (field: keyof ExamData) => {
    if(!isEditing) return;
    setFormData(prev => {
        const newState = { ...prev, [field]: !prev[field as keyof ExamData] };
        if (field === "history_diabetes" && !newState.history_diabetes) newState.history_diabetes_controlled = false;
        if ((field === "history_hypertension" || field === "history_hypotension") && !newState.history_hypertension && !newState.history_hypotension) newState.condition_controlled = false;
        if (field === "is_tinte" && !newState.is_tinte) newState.tone = "";
        return newState;
    });
  };

  const handleArrayCheck = (category: "lens_type" | "lens_material", value: string) => {
    if(!isEditing) return;
    setFormData(prev => {
      const current = prev[category];
      if (current.includes(value)) return { ...prev, [category]: current.filter(i => i !== value) };
      return { ...prev, [category]: [...current, value] };
    });
  };

  // --- LÓGICA DE GUARDADO INTELIGENTE (INSERT O UPDATE) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const finalMaterialString = getMaterialSummary();
    // Extraemos ID por separado para saber si existe
    const { id, is_tinte, tone, antiblue, ...rawData } = formData; 

    const payloadBase = {
      ...rawData,
      lens_type: formData.lens_type.join(", "),
      lens_material: formData.lens_material.join(", "),
      material_final: finalMaterialString,
      created_by: user?.id
    };

    const cleanPayload = Object.fromEntries(
      Object.entries(payloadBase).map(([key, value]) => {
        if (value === "") return [key, null];
        return [key, value];
      })
    );

    let error;

    if (id) {
        // SI TIENE ID => ACTUALIZAMOS (UPDATE)
        const { error: updateError } = await supabase
            .from("prescriptions")
            .update(cleanPayload)
            .eq("id", id);
        error = updateError;
    } else {
        // SI NO TIENE ID => CREAMOS NUEVO (INSERT)
        const { error: insertError } = await supabase
            .from("prescriptions")
            .insert([cleanPayload]);
        error = insertError;
    }

    setLoading(false);
    if (error) alert("Error: " + error.message);
    else { 
        alert(id ? "✅ Ficha Actualizada" : "✅ Ficha Creada"); 
        onSuccess(); 
    }
  };

  const handlePrint = () => window.print();

  const DiopterInput = ({ value, field, placeholder }: any) => (
    <input disabled={!isEditing} type="number" step="0.25" className="w-full text-center p-1 font-bold outline-none bg-transparent" placeholder={placeholder} 
    value={value || ""} 
    onChange={(e) => handleDiopterChange(e, field)} onBlur={(e) => handleDiopterBlur(e, field)} />
  );
  const AxisInput = ({ value, field }: any) => (
    <input disabled={!isEditing} type="number" min="0" max="180" className="w-full text-center p-1 font-bold outline-none bg-transparent" placeholder="0-180" 
    value={value || ""} 
    onChange={(e) => handleAxis(e, field)} />
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto flex justify-center items-start p-2 md:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl relative print:shadow-none print:w-full">
        
        <style jsx global>{`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            #printable-ticket, #printable-ticket * { visibility: visible; }
            #printable-ticket { position: fixed; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; background: white; z-index: 9999; }
            #printable-ticket input, #printable-ticket div, #printable-ticket td { color: black !important; border-color: black !important; }
            .no-print, button, nav { display: none !important; }
          }
        `}</style>

        {/* BOTÓN CERRAR */}
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 no-print z-10"><X size={28} /></button>

        <div className="p-6 md:p-10 font-sans text-sm text-gray-800">
          
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-6 border-b-2 border-valora-navy pb-4 gap-4 no-print">
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center text-valora-navy font-bold leading-tight">
                    <Eye size={40} className="mb-1"/>
                    <span className="text-xs uppercase tracking-widest">Valora</span>
                    <span className="text-xs uppercase tracking-widest">Vissión</span>
                </div>
                <h2 className="text-3xl font-bold text-valora-navy tracking-tight">Ficha clínica</h2>
            </div>
            <div className="text-right w-full md:w-auto flex flex-col items-end">
                <div className="bg-gray-100 text-gray-600 px-4 py-1 font-bold text-lg rounded-sm mb-1 border border-gray-300 w-fit">
                    FOLIO: {formData.id ? String(formData.id).padStart(4, '0') : "NUEVO"}
                </div>
                <div className="flex items-center gap-2">
                    <label className="font-bold text-red-600">Fecha:</label>
                    <input type="date" disabled={!isEditing} className="bg-transparent font-medium" value={formData.last_exam_date || ""} onChange={e => setFormData({...formData, last_exam_date: e.target.value})} />
                </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="no-print space-y-6">
                
                {/* SI ESTAMOS EDITANDO O CREANDO, MOSTRAMOS TODO ESTO */}
                <div className={`space-y-3 bg-blue-50/50 p-4 rounded-lg border border-blue-100 ${!isEditing ? 'opacity-80' : ''}`}>
                    <div className="flex flex-col md:flex-row gap-2 md:items-center">
                        <label className="font-bold text-valora-navy w-20">Nombre:</label>
                        <input required disabled={!isEditing} className="flex-1 border-b border-gray-300 bg-transparent outline-none uppercase font-medium w-full" value={formData.patient_name || ""} onChange={e => setFormData({...formData, patient_name: e.target.value})} />
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:items-center">
                        <label className="font-bold text-valora-navy w-20">Dirección:</label>
                        <input disabled={!isEditing} className="flex-1 border-b border-gray-300 bg-transparent outline-none w-full" value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-2 items-center"><label className="font-bold text-valora-navy w-20">Teléfono:</label><input disabled={!isEditing} className="flex-1 border-b border-gray-300 bg-transparent outline-none" value={formData.phone || ""} onChange={(e) => handleInt(e, 'phone')} /></div>
                        <div className="flex gap-2 items-center"><label className="font-bold text-valora-navy">Edad:</label><input disabled={!isEditing} className="w-20 border-b border-gray-300 bg-transparent outline-none text-center" value={formData.age || ""} onChange={(e) => handleInt(e, 'age')} /></div>
                    </div>
                     <div className="flex gap-2 items-center"><label className="font-bold text-valora-navy w-20">Ocupación:</label><input disabled={!isEditing} className="flex-1 border-b border-gray-300 bg-transparent outline-none" value={formData.occupation || ""} onChange={e => setFormData({...formData, occupation: e.target.value})} /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-xs md:text-sm p-2">
                    <div className="space-y-1">
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded"><input type="checkbox" disabled={!isEditing} checked={formData.history_hypertension} onChange={() => handleCheck('history_hypertension')} /> Presión alta</label>
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded"><input type="checkbox" disabled={!isEditing} checked={formData.history_hypotension} onChange={() => handleCheck('history_hypotension')} /> Presión baja</label>
                        {(formData.history_hypertension || formData.history_hypotension) && <label className="flex items-center gap-2 ml-4 text-green-700 bg-green-50 p-1 rounded cursor-pointer animate-pulse"><input type="checkbox" disabled={!isEditing} checked={formData.condition_controlled} onChange={() => handleCheck('condition_controlled')} /> ¿Está controlada?</label>}
                    </div>
                    <div className="space-y-1">
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded"><input type="checkbox" disabled={!isEditing} checked={formData.history_diabetes} onChange={() => handleCheck('history_diabetes')} /> Diabetes</label>
                        {formData.history_diabetes && <label className="flex items-center gap-2 ml-4 text-green-700 bg-green-50 p-1 rounded cursor-pointer animate-pulse"><input type="checkbox" disabled={!isEditing} checked={formData.history_diabetes_controlled} onChange={() => handleCheck('history_diabetes_controlled')} /> ¿Está controlado?</label>}
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded"><input type="checkbox" disabled={!isEditing} checked={formData.history_headache} onChange={() => handleCheck('history_headache')} /> Dolor de cabeza</label>
                    </div>
                    <div className="space-y-1">
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded"><input type="checkbox" disabled={!isEditing} checked={formData.history_tearing} onChange={() => handleCheck('history_tearing')} /> Ojos llorosos</label>
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded"><input type="checkbox" disabled={!isEditing} checked={formData.history_burning} onChange={() => handleCheck('history_burning')} /> Ardor</label>
                    </div>
                </div>

                <div className="flex flex-wrap bg-blue-100 p-2 rounded items-center gap-4 justify-center text-xs md:text-sm font-bold text-valora-navy">
                    <div className="flex items-center gap-1">OD AV 20/<input disabled={!isEditing} className="w-10 p-1 text-center rounded border border-blue-200 bg-transparent" value={formData.av_od || ""} onChange={e => handleInt(e, 'av_od')} /></div>
                    <div className="flex items-center gap-1">OI AV 20/<input disabled={!isEditing} className="w-10 p-1 text-center rounded border border-blue-200 bg-transparent" value={formData.av_oi || ""} onChange={e => handleInt(e, 'av_oi')} /></div>
                    <div className="flex items-center gap-1 ml-4">DIP/<input disabled={!isEditing} className="w-10 p-1 text-center rounded border border-blue-200 bg-transparent" value={formData.dip || ""} onChange={e => handleInt(e, 'dip')} /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="border border-blue-200 rounded-lg overflow-hidden">
                        <div className="bg-blue-600 text-white text-center font-bold py-1 text-xs uppercase">Graduación Anterior</div>
                        <table className="w-full text-center text-sm">
                            <thead className="bg-blue-50 text-xs"><tr><th></th><th>ESF</th><th>CIL</th><th>EJE</th><th>ADD</th></tr></thead>
                            <tbody>
                                <tr><td className="font-bold text-xs bg-blue-50">OD</td><td><DiopterInput value={formData.prev_sph_od} field="prev_sph_od" placeholder="0.00" /></td><td><DiopterInput value={formData.prev_cyl_od} field="prev_cyl_od" placeholder="0.00" /></td><td><AxisInput value={formData.prev_axis_od} field="prev_axis_od" /></td><td><DiopterInput value={formData.prev_add_od} field="prev_add_od" placeholder="+0.00" /></td></tr>
                                <tr><td className="font-bold text-xs bg-blue-50">OI</td><td><DiopterInput value={formData.prev_sph_oi} field="prev_sph_oi" placeholder="0.00" /></td><td><DiopterInput value={formData.prev_cyl_oi} field="prev_cyl_oi" placeholder="0.00" /></td><td><AxisInput value={formData.prev_axis_oi} field="prev_axis_oi" /></td><td><DiopterInput value={formData.prev_add_oi} field="prev_add_oi" placeholder="+0.00" /></td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="border border-valora-green rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-valora-navy text-white text-center font-bold py-1 text-xs uppercase">Graduación Actual</div>
                        <table className="w-full text-center text-sm">
                            <thead className="bg-gray-100 text-xs"><tr><th></th><th>ESF</th><th>CIL</th><th>EJE</th><th>ADD</th></tr></thead>
                            <tbody>
                                <tr><td className="font-bold text-xs bg-gray-50">OD</td><td><DiopterInput value={formData.sph_od} field="sph_od" placeholder="0.00" /></td><td><DiopterInput value={formData.cyl_od} field="cyl_od" placeholder="0.00" /></td><td><AxisInput value={formData.axis_od} field="axis_od" /></td><td rowSpan={2} className="align-middle border-l"><DiopterInput value={formData.add_power} field="add_power" placeholder="+0.00" /></td></tr>
                                <tr><td className="font-bold text-xs bg-gray-50">OI</td><td><DiopterInput value={formData.sph_oi} field="sph_oi" placeholder="0.00" /></td><td><DiopterInput value={formData.cyl_oi} field="cyl_oi" placeholder="0.00" /></td><td><AxisInput value={formData.axis_oi} field="axis_oi" /></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs md:text-sm bg-gray-50 p-4 rounded border border-gray-200">
                    <div className="space-y-1">
                        <h4 className="font-bold text-valora-navy mb-1 text-xs uppercase">Tipo</h4>
                        {["Monofocal", "Bifocal", "Progresivo", "Invisible"].map(item => (<label key={item} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" disabled={!isEditing} checked={formData.lens_type.includes(item)} onChange={() => handleArrayCheck('lens_type', item)} /> {item}</label>))}
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-valora-navy mb-1 text-xs uppercase">Tratamiento</h4>
                        {["Cristal", "Poli", "Transitions", "AR"].map(item => (<label key={item} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" disabled={!isEditing} checked={formData.lens_material.includes(item)} onChange={() => handleArrayCheck('lens_material', item)} /> {item}</label>))}
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-blue-600"><input type="checkbox" disabled={!isEditing} checked={formData.antiblue} onChange={() => handleCheck('antiblue')} /> Antiblue</label>
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-2 border-l pl-4 border-gray-300">
                       <label className="flex items-center gap-2 cursor-pointer font-bold text-valora-navy"><input type="checkbox" disabled={!isEditing} checked={formData.is_tinte} onChange={() => handleCheck('is_tinte')} /> Tinte</label>
                       {formData.is_tinte && (<div className="flex gap-2 items-center"><span className="text-xs font-bold">Tono:</span> <input disabled={!isEditing} className="border-b border-valora-navy bg-transparent w-full outline-none text-sm px-1" placeholder="Ej. Café 2" value={formData.tone || ""} onChange={e => setFormData({...formData, tone: e.target.value})} /></div>)}
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN IMPRIMIBLE (RECETA) --- */}
            <div id="printable-ticket" className="border-t-4 border-dashed border-gray-300 pt-6 mt-8">
                
                <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-valora-navy">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center text-valora-navy font-bold leading-tight">
                            <Eye size={50} className="mb-1"/>
                            <span className="text-sm uppercase tracking-widest">Valora</span>
                            <span className="text-sm uppercase tracking-widest">Vissión</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-valora-navy">Receta Óptica</h2>
                        <p className="text-sm text-gray-500">Folio: {formData.id ? String(formData.id).padStart(4, '0') : "NUEVO"}</p>
                        <p className="text-sm text-gray-500">Fecha: {formData.last_exam_date}</p>
                    </div>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 print:bg-white print:border-none print:p-0">
                    <div className="flex gap-2 mb-4">
                        <label className="font-bold text-valora-navy">PACIENTE:</label>
                        <div className="border-b border-gray-400 flex-1 px-2 font-bold uppercase text-gray-700">
                            {formData.patient_name || "_________________________________"}
                        </div>
                    </div>

                    <table className="w-full text-center text-sm mb-6 bg-white rounded overflow-hidden shadow-sm print:border print:border-black">
                        <thead className="bg-valora-navy text-white text-xs print:bg-gray-200 print:text-black">
                            <tr>
                                <th className="py-2 border border-transparent print:border-black">OJO</th>
                                <th className="py-2 border border-transparent print:border-black">ESFERA</th>
                                <th className="py-2 border border-transparent print:border-black">CILINDRO</th>
                                <th className="py-2 border border-transparent print:border-black">EJE</th>
                                <th className="py-2 border border-transparent print:border-black">ADICIÓN</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b print:border-black">
                                <td className="font-bold bg-gray-100 text-xs py-3 print:bg-white print:border-r print:border-black">OD</td>
                                <td className="p-1 font-mono font-bold text-lg print:border-r print:border-black">{formData.sph_od}</td>
                                <td className="p-1 font-mono font-bold text-lg print:border-r print:border-black">{formData.cyl_od}</td>
                                <td className="p-1 font-mono font-bold text-lg print:border-r print:border-black">{formData.axis_od}</td>
                                <td rowSpan={2} className="align-middle bg-green-50 font-bold font-mono text-lg print:bg-white">{formData.add_power}</td>
                            </tr>
                            <tr>
                                <td className="font-bold bg-gray-100 text-xs py-3 print:bg-white print:border-r print:border-black">OI</td>
                                <td className="p-1 font-mono font-bold text-lg print:border-r print:border-black">{formData.sph_oi}</td>
                                <td className="p-1 font-mono font-bold text-lg print:border-r print:border-black">{formData.cyl_oi}</td>
                                <td className="p-1 font-mono font-bold text-lg print:border-r print:border-black">{formData.axis_oi}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="flex gap-2 mb-2">
                        <label className="font-bold text-valora-navy text-xs uppercase w-24">Material:</label>
                        <div className="border-b border-gray-400 flex-1 px-2 text-sm text-gray-700 font-bold uppercase">
                            {getMaterialSummary() || "_________________________________"}
                        </div>
                    </div>
                </div>

                <div className="hidden print:block mt-24 pt-8 border-t border-gray-400 text-center">
                    <p className="font-bold text-valora-navy">Valora Vissión Óptica</p>
                    <p className="text-xs text-gray-500">Mercado del Campesino, Guadalajara, Jal.</p>
                </div>
            </div>

            {/* --- BARRA DE ACCIONES (NO SE IMPRIME) --- */}
            <div className="flex gap-4 pt-4 border-t no-print">
                {isEditing ? (
                    // MODO EDICIÓN / CREACIÓN
                    <>
                        {initialData && (
                            <button type="button" onClick={() => {setIsEditing(false); onCancel();}} className="bg-gray-100 text-gray-600 px-4 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200"><Ban size={18}/> Cancelar Edición</button>
                        )}
                        {!initialData && (
                            <button type="button" onClick={onCancel} className="flex-1 py-3 text-gray-500 hover:bg-gray-100 rounded-lg font-bold">Cancelar</button>
                        )}
                        <button disabled={loading} className="flex-2 w-full bg-valora-navy text-white py-3 rounded-lg font-bold hover:bg-valora-green transition shadow-lg flex justify-center items-center gap-2">
                            <Save size={18} /> {loading ? "Guardando..." : "Guardar Ficha"}
                        </button>
                    </>
                ) : (
                    // MODO VISUALIZACIÓN
                    <>
                        <button type="button" onClick={() => setIsEditing(true)} className="flex-1 bg-blue-50 text-valora-navy border border-blue-200 py-3 rounded-lg font-bold hover:bg-blue-100 transition flex justify-center items-center gap-2">
                            <Pencil size={18} /> Modificar
                        </button>
                        <button type="button" onClick={handlePrint} className="flex-2 w-full bg-valora-navy text-white py-3 rounded-lg font-bold hover:bg-valora-green transition flex justify-center items-center gap-2 shadow-lg">
                            <Printer size={20} /> Imprimir Receta
                        </button>
                    </>
                )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}