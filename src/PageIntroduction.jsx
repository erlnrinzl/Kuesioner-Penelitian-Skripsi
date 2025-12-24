// --- HALAMAN 1: PERKENALAN ---
import { Info, ChevronRight } from 'lucide-react';
import binusLogo from './assets/binus-logo.png';

// --- DATA KONSTANTA ---
const JOB_TITLES = [
  "Kepala Pusat Layanan dan Informasi",
  "Tim Teknis Kemenkeu Cloud Platform",
  "Pengelola Risiko",
  "Pegawai Pusat Infrastruktur, Layanan, dan Keamanan Informasi"
];

export default function PageIntroduction({ userData, setUserData, onNext }) {
  const isFormValid = userData.name.length > 2 && userData.job !== '';

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 animate-fade-in">
      <div className="flex justify-left mb-8 border-b border-slate-100 pb-8">
        <img 
          src={binusLogo} 
          alt="Binus University School of Information Systems" 
          className="h-24 md:h-32 object-contain hover:scale-105 transition-transform duration-300" 
        />
      </div>
      
      <div className="border-b pb-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">Yth. Bapak/Ibu Pengelola Kemenkeu Cloud Platform,</h1>
        <p className="text-slate-600">Badan Teknologi, Informasi, dan Intelijen Keuangan</p>
      </div>

      <div className="space-y-4 text-justify text-slate-700 leading-relaxed">
        <p>Perkenalkan kami mahasiswa <strong>Universitas Bina Nusantara</strong>, terdiri atas:</p>
        <ul className="list-disc list-inside ml-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <li>Bima Jatmiko Abadi</li>
          <li>Henrich Fergian Lizarazu</li>
          <li>Tiara Febriana Yosephine</li>
        </ul>
        <p>
          Saat ini kami sedang menyusun penelitian skripsi berjudul 
          <span className="font-semibold text-blue-800 block mt-1">
            "Rekomendasi Cloud Deployment Model Pada Kemenkeu Cloud Platform Menggunakan TOE Framework".
          </span>
        </p>
        <p>
          Mengingat peran strategis Bapak/Ibu dalam transformasi digital di Kemenkeu, pandangan Bapak/Ibu sangat krusial 
          untuk menentukan arah kebijakan infrastruktur TI yang lebih efisien dan aman. 
          Kuesioner ini bertujuan untuk mendapatkan bobot prioritas guna merekomendasikan cloud deployment model 
          (Private, Public, Hybrid, atau Community) yang sesuai untuk Kemenkeu Cloud Platform (KCP).
        </p>
        <p className="text-sm italic text-slate-500 border-l-4 border-blue-400 pl-3">
          Segala informasi yang Bapak/Ibu berikan akan dijaga kerahasiaannya dan hanya digunakan untuk kepentingan akademis.
        </p>
      </div>

      <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
        <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
          <Info size={20}/> Identitas Responden
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Masukkan nama lengkap Anda"
              value={userData.name}
              onChange={(e) => setUserData({...userData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jabatan</label>
            <select 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={userData.job}
              onChange={(e) => setUserData({...userData, job: e.target.value})}
            >
              <option value="">-- Pilih Jabatan --</option>
              {JOB_TITLES.map((title, idx) => (
                <option key={idx} value={title}>{title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 text-right">
        <button 
          onClick={onNext}
          disabled={!isFormValid}
          className={`px-8 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2 ml-auto
            ${isFormValid ? 'bg-blue-900 text-white hover:bg-blue-800 hover:-translate-y-1' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}
          `}
        >
          Mulai Survei <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};