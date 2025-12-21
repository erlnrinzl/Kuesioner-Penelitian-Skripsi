import { ChevronRight } from 'lucide-react';

// --- HALAMAN 2: PETUNJUK ---
export default function PageInstructions({ onNext, onBack }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Petunjuk Pengisian Pairwise Comparison</h2>
      
      <div className="space-y-4 text-slate-700 leading-relaxed">
        <p>
          Pada kuesioner ini, kami memohon bantuan Bapak/Ibu untuk membandingkan tingkat kepentingan antara dua faktor penentu kebijakan. 
          Penilaian ini bertujuan mengkuantifikasi preferensi Bapak/Ibu agar menghasilkan rekomendasi yang terukur.
        </p>
        <p>
          Mohon pilih pada salah satu angka skala <strong>1, 3, 5, 7, atau 9</strong> yang tersedia di antara dua kriteria.
        </p>
      </div>

      <div className="my-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-3">Panduan Skala Nilai (Saaty)</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-3"><span className="font-bold bg-white px-2 py-1 rounded border min-w-[3rem] text-center">1</span> <span>Kedua faktor <strong>sama pentingnya</strong>.</span></li>
          <li className="flex gap-3"><span className="font-bold bg-white px-2 py-1 rounded border min-w-[3rem] text-center">3</span> <span>Satu faktor <strong>sedikit lebih penting</strong> dari faktor yang lain.</span></li>
          <li className="flex gap-3"><span className="font-bold bg-white px-2 py-1 rounded border min-w-[3rem] text-center">5</span> <span>Satu faktor <strong>lebih penting</strong> dari faktor yang lain.</span></li>
          <li className="flex gap-3"><span className="font-bold bg-white px-2 py-1 rounded border min-w-[3rem] text-center">7</span> <span>Satu faktor <strong>sangat lebih penting</strong> dari faktor yang lain.</span></li>
          <li className="flex gap-3"><span className="font-bold bg-white px-2 py-1 rounded border min-w-[3rem] text-center">9</span> <span>Satu faktor <strong>mutlak lebih penting</strong> dari faktor yang lain.</span></li>
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="font-bold text-slate-800 mb-3">Contoh Tampilan Pengisian</h3>
        <p className="text-sm text-slate-600 mb-2">
          Jika Anda merasa <strong>IT Infrastructure</strong> lebih penting (nilai 5) dibanding Data Security:
        </p>
        {/* Dummy UI Component for Example */}
        <div className="opacity-75 pointer-events-none bg-white p-4 rounded-lg border-2 border-dashed border-slate-300">
            <div className="flex flex-col items-center">
                <div className="flex justify-between w-full font-semibold text-slate-700 mb-2">
                    <span>IT Infrastructure</span>
                    <span>Data Security</span>
                </div>
                <div className="flex gap-1 w-full justify-between items-center bg-slate-100 p-2 rounded-full">
                    {[9, 7, 5, 3, 1, 3, 5, 7, 9].map((val, i) => (
                        <div key={i} className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold border 
                            ${i === 2 ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-110' : 'bg-white text-slate-400 border-slate-200'}`}>
                            {val}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="px-6 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
          Kembali
        </button>
        <button onClick={onNext} className="px-8 py-3 rounded-lg font-bold bg-blue-900 text-white shadow-lg hover:bg-blue-800 transition-all flex items-center gap-2">
          Lanjut ke Survei <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};