import { ChevronRight, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// --- HALAMAN AKHIR: FINISH ---
export default function PageFinish({ userData }) {
  return (
    <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-200 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-bold text-blue-900 mb-4">Terima Kasih!</h2>
        <p className="text-slate-600 mb-8 max-w-lg mx-auto">
            Terima kasih Bapak/Ibu <strong>{userData.name}</strong> atas waktu dan partisipasi berharga Anda dalam penelitian ini. 
            Data yang Anda berikan sangat berarti bagi pengembangan Kemenkeu Cloud Platform.
        </p>
        <div className="p-4 bg-slate-50 rounded border border-slate-200 text-sm text-slate-500">
            Anda dapat menutup halaman ini sekarang.
        </div>
    </div>
  );
};