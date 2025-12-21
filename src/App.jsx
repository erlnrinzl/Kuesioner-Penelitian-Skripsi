import { useState } from 'react'
import PageIntroduction from './PageIntroduction';
import PageInstructions from './PageInstruction';
import AHPSurveyPage from './AHPSurveyPage';
import PageFinish from './PageFinish';

// --- DATA KONSTANTA ---
const FACTORS_LEVEL_1 = [
  { id: 0, name: 'Technology', desc: 'Berfokus pada teknologi internal dan eksternal yang relevan serta tersedia bagi operasional organisasi.' },
  { id: 1, name: 'Organization', desc: 'Mencakup karakteristik internal organisasi seperti ukuran, struktur manajemen, sumber daya, dan budaya kerja.' },
  { id: 2, name: 'Environment', desc: 'Meliputi faktor eksternal dari operasi organisasi, seperti competitor, struktur industri, dan regulasi pemerintah.' },
];

const FACTORS_TECH = [
  { id: 0, name: 'IT Infrastructure', desc: 'Ketersediaan perangkat keras dan jaringan untuk mendukung performa serta skalabilitas layanan cloud.' },
  { id: 1, name: 'Data Security', desc: 'Jaminan perlindungan kerahasiaan data negara dan kepatuhan terhadap standar keamanan informasi.' },
  { id: 2, name: 'System Compatibility', desc: 'Kemampuan sistem cloud berinteraksi dengan aplikasi legacy dan teknologi yang sudah ada.' },
];

const FACTORS_ORG = [
  { id: 0, name: 'Leadership Support', desc: 'Komitmen para pimpinan dalam penyediaan sumber daya, anggaran, dan arahan strategis transformasi digital.' },
  { id: 1, name: 'Employee Readiness', desc: 'Kompetensi teknis dan kesiapan SDM dalam mengelola serta mengoperasikan teknologi cloud.' },
  { id: 2, name: 'Governance Structure', desc: 'Kejelasan struktur pengawasan, kebijakan internal, SOP, dan prosedur audit dalam pengelolaan layanan cloud.' },
];

const FACTORS_ENV = [
  { id: 0, name: 'Government Policies', desc: 'Kepatuhan terhadap regulasi pemerintah pusat terkait data sovereignty, data residency, dan standar layanan publik digital.' },
  { id: 1, name: 'Vendor Ecosystem', desc: 'Ketersediaan dukungan teknis dan kemudahan integrasi layanan dari penyedia cloud pihak ketiga.' },
  { id: 2, name: 'Stakeholder Pressure', desc: 'Desakan kebutuhan layanan cepat dari unit pengguna (DJA, DJBC, DJKN) dan ekspektasi kinerja publik.' },
];

function App() {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({ name: '', job: '' });
  const [results, setResults] = useState({});

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleDataSave = (key, data) => {
    setResults(prev => ({ ...prev, [key]: data }));
    console.log(results);
    nextStep();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-2 bg-slate-200 z-50">
        <div 
          className="h-full bg-blue-900 transition-all duration-500 ease-out"
          style={{ width: `${(step / 7) * 100}%` }}
        ></div>
      </div>

      <main className="container mx-auto max-w-4xl px-4 pt-10">
        {step === 1 && <PageIntroduction userData={userData} setUserData={setUserData} onNext={nextStep} />}
        {step === 2 && <PageInstructions onNext={nextStep} onBack={prevStep} />}
        
        {step === 3 && (
          <AHPSurveyPage 
            title="Perbandingan Level 1: Konteks TOE"
            description="Mohon perkenan Bapak/Ibu memberikan urutan prioritas untuk 3 aspek TOE berikut:"
            factors={FACTORS_LEVEL_1}
            onNext={(data) => handleDataSave('TOE', data)}
            onBack={prevStep}
          />
        )}

        {step === 4 && (
          <AHPSurveyPage 
            title="Perbandingan Level 2: Dimensi TECHNOLOGY"
            description="Mohon perkenan Bapak/Ibu memberikan urutan prioritas untuk 3 aspek teknologi berikut:"
            factors={FACTORS_TECH}
            onNext={(data) => handleDataSave('TECH', data)}
            onBack={prevStep}
          />
        )}

        {step === 5 && (
          <AHPSurveyPage 
            title="Perbandingan Level 2: Dimensi ORGANIZATION"
            description="Mohon perkenan Bapak/Ibu memberikan urutan prioritas untuk 3 aspek organisasi berikut:"
            factors={FACTORS_ORG}
            onNext={(data) => handleDataSave('ORG', data)}
            onBack={prevStep}
          />
        )}

        {step === 6 && (
          <AHPSurveyPage 
            title="Perbandingan Level 2: Dimensi ENVIRONMENT"
            description="Mohon perkenan Bapak/Ibu memberikan urutan prioritas untuk 3 aspek environment berikut:"
            factors={FACTORS_ENV}
            onNext={(data) => handleDataSave('ENV', data)}
            onBack={prevStep}
          />
        )}

        {step === 7 && <PageFinish results={results} userData={userData} />}
      </main>
    </div>
  );
}

export default App
