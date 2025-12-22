import React, { useState, useMemo } from 'react';
import { ChevronRight, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function AHPSurveyPage({ title, description, factors, onNext, onBack, savedData }){
  // 1. Inisialisasi State Comparisons
  // Jika ada savedData, ambil 'raw_comparisons'-nya. Jika tidak, set null semua.
  const [comparisons, setComparisons] = useState(() => {
    if (savedData && savedData.raw_comparisons) {
      return savedData.raw_comparisons;
    }
    return { "0-1": null, "1-2": null, "0-2": null };
  });

  const [rankings, setRankings] = useState(() => {
    if (savedData && savedData.rankings) {
      return {
        1: savedData.rankings["Rank 1"] || "",
        2: savedData.rankings["Rank 2"] || "",
        3: savedData.rankings["Rank 3"] || ""
      };
    }
    return { 1: "", 2: "", 3: "" };
  });

  // Saaty Scale Visual
  const scaleValues = [9, 7, 5, 3, 1, 3, 5, 7, 9];

  // Helper: Visual Index to Numeric AHP Value
  const getNumericValue = (scaleVal, positionIndex) => {
    if (scaleVal === 1) return 1;
    if (positionIndex < 4) return scaleVal; // Left side dominant
    return 1 / scaleVal; // Right side dominant
  };

  const handleSelection = (pairKey, scaleVal, positionIndex) => {
    const numericVal = getNumericValue(scaleVal, positionIndex);
    setComparisons(prev => ({ ...prev, [pairKey]: numericVal }));
  };

  // --- LOGIKA BARU UNTUK WARNING MULTIPLE ---
  const activeWarnings = useMemo(() => {
    const warnings = [];
    
    Object.entries(comparisons).forEach(([key, val]) => {
      // Cek apakah nilai 9 (Mutlak Kiri) atau mendekati 0.111 (Mutlak Kanan / 1 per 9)
      // Kita pakai batas <= 0.12 untuk menangkap 1/9
      if (val === 9 || (val !== null && val <= 0.12)) {
        
        const [idA, idB] = key.split('-').map(Number);
        const factorA = factors.find(f => f.id === idA)?.name;
        const factorB = factors.find(f => f.id === idB)?.name;
        
        // Tentukan siapa yang dominan
        const dominantName = val === 9 ? factorA : factorB;
        const weakName = val === 9 ? factorB : factorA;

        warnings.push({
          key: key,
          message: `Anda menilai "${dominantName}" MUTLAK LEBIH PENTING (9) dibanding "${weakName}".`
        });
      }
    });

    return warnings;
  }, [comparisons, factors]);

  // --- PERBAIKAN DI SINI (Ganti useEffect dengan useMemo) ---
  // Kita menghitung CR secara langsung setiap kali 'comparisons' berubah.
  // Tidak perlu setState, jadi tidak ada cascading render error.
  const crResult = useMemo(() => {
    // 1. Cek apakah semua nilai sudah terisi
    if (Object.values(comparisons).some(v => v === null)) {
      return { cr: 0, consistent: true, incomplete: true };
    }

    const n = 3;
    const RI = 0.58; 
    
    // 2. Buat Matriks
    const matrix = [
      [1, comparisons["0-1"], comparisons["0-2"]],
      [1/comparisons["0-1"], 1, comparisons["1-2"]],
      [1/comparisons["0-2"], 1/comparisons["1-2"], 1]
    ];

    // 3. Hitung Penjumlahan Kolom
    const colSums = [0, 0, 0];
    matrix.forEach(row => row.forEach((val, j) => colSums[j] += val));

    // 4. Hitung Priority Vector (Bobot)
    const priorities = matrix.map(row => 
      row.reduce((sum, val, j) => sum + (val / colSums[j]), 0) / n
    );

    // 5. Hitung Lambda Max
    const lambdaMax = colSums.reduce((sum, colSum, i) => sum + (colSum * priorities[i]), 0);
    
    // 6. Hitung CI dan CR
    const CI = (lambdaMax - n) / (n - 1);
    const CR = CI / RI;

    return { 
      cr: CR, 
      consistent: CR <= 0.1, 
      incomplete: false 
    };
  }, [comparisons]); // Hanya hitung ulang jika comparisons berubah

  const pairs = [
    { key: "0-1", left: 0, right: 1 },
    { key: "1-2", left: 1, right: 2 },
    { key: "0-2", left: 0, right: 2 }
  ];

  const isPreRankingComplete = rankings[1] && rankings[2] && rankings[3];
  const isComparisonComplete = !crResult.incomplete; // Gunakan hasil useMemo

  const handleSave = () => {
    
    // 1. Transformasi Data Comparison
    const readableComparisons = {};
    const detailedComparisons = []; // Opsional: format array jika butuh detail lebih

    Object.entries(comparisons).forEach(([key, value]) => {
      const [idA, idB] = key.split('-').map(Number); // Pisahkan "0-1" jadi 0 dan 1
      
      // Ambil nama faktor berdasarkan ID
      const factorA = factors.find(f => f.id === idA)?.name;
      const factorB = factors.find(f => f.id === idB)?.name;

      // Buat key yang mudah dibaca
      // Contoh output key: "Leadership Support vs Employee Readiness"
      readableComparisons[`${factorA} vs ${factorB}`] = value;
      
      // Opsional: Buat versi array jika nanti butuh filter
      detailedComparisons.push({
        factor_1: factorA,
        factor_2: factorB,
        score: value
      });
    });

    // 2. Transformasi Data Ranking (Agar tidak cuma index 1,2,3)
    const readableRankings = {
      "Rank 1": rankings[1],
      "Rank 2": rankings[2],
      "Rank 3": rankings[3]
    };

    // 3. Kirim data yang sudah "Cantik" ke App.jsx
    onNext({ 
      comparisons: readableComparisons, // Ini yang Anda request (Key nama variable)
      details: detailedComparisons,     // Format array (opsional, berguna untuk coding lanjut)
      raw_comparisons: comparisons,     // Tetap simpan raw data (0-1) untuk backup/debug
      rankings: readableRankings, 
      cr: crResult.cr 
    });
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 animate-fade-in mb-10">
      <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-2">{title}</h2>
      <p className="text-slate-600 mb-6">{description}</p>

      {/* DEFINITIONS */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {factors.map(f => (
          <div key={f.id} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="font-bold text-blue-800 mb-1">{f.name}</h4>
            <p className="text-xs text-slate-600 leading-snug">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* PRE-RANKING (ANCHOR) */}
      <div className="mb-10 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CheckCircle size={18} className="text-blue-600"/> Langkah 1: Urutan Prioritas (Pre-Ranking)
        </h3>
        <p className="text-sm text-slate-500 mb-4">Sebelum mengisi angka, mohon urutkan prioritas menurut intuisi profesional Anda:</p>
        <div className="space-y-3 max-w-md">
            {[1, 2, 3].map(rank => (
                <div key={rank} className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-blue-900 text-white rounded-full font-bold text-sm">#{rank}</span>
                    <select 
                        className="flex-1 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        value={rankings[rank]}
                        onChange={(e) => setRankings({...rankings, [rank]: e.target.value})}
                    >
                        <option value="">-- Pilih Faktor --</option>
                        {factors.filter(f => !Object.values(rankings).includes(f.name) || rankings[rank] === f.name).map(f => (
                            <option key={f.id} value={f.name}>{f.name}</option>
                        ))}
                    </select>
                </div>
            ))}
        </div>
      </div>

      {/* PAIRWISE COMPARISON */}
      <div className={!isPreRankingComplete ? "opacity-50 pointer-events-none filter blur-sm transition-all" : "transition-all"}>
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CheckCircle size={18} className="text-blue-600"/> Langkah 2: Perbandingan Berpasangan
        </h3>
        
        {activeWarnings.length > 0 && (
          <div className="mb-6 space-y-2">
            {activeWarnings.map((warn) => (
              <div 
                key={warn.key} 
                className="p-3 bg-yellow-50 text-yellow-800 text-sm border-l-4 border-yellow-400 rounded flex items-start gap-2 animate-fade-in shadow-sm"
              >
                <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-yellow-600"/> 
                <span>
                  <span className="font-bold">Perhatian Ekstrem Faktor:</span> {warn.message}
                </span>
              </div>
            ))}
            <div className="text-xs text-slate-500 pl-1 italic">
              *Pastikan nilai Mutlak (9) ini memang sesuai dengan preferensi ekstrem Anda.
            </div>
          </div>
        )}


        <div className="space-y-6">
          {pairs.map((pair) => {
             const leftName = factors[pair.left].name;
             const rightName = factors[pair.right].name;
             const currentVal = comparisons[pair.key];

             return (
               <div key={pair.key} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                 <div className="flex justify-between items-center mb-3 font-semibold text-slate-700 text-sm md:text-base">
                   <span className="w-1/3 text-left">{leftName}</span>
                   <span className="text-xs text-slate-400">vs</span>
                   <span className="w-1/3 text-right">{rightName}</span>
                 </div>
                 
                 <div className="flex justify-between items-center relative py-2">
                   <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-0"></div>
                   {scaleValues.map((val, idx) => {
                     const numericValueHere = getNumericValue(val, idx);
                     const isSelected = currentVal !== null && Math.abs(currentVal - numericValueHere) < 0.0001;
                     
                     return (
                       <label key={idx} className="relative z-10 cursor-pointer group flex flex-col items-center">
                         <input
                           type="radio"
                           name={`pair-${pair.key}`}
                           value={val}
                           onChange={() => handleSelection(pair.key, val, idx)}
                           className="sr-only"
                         />
                         <div className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border transition-all font-bold text-xs md:text-sm
                           ${isSelected 
                             ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-md' 
                             : 'bg-white border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500'
                           }
                         `}>
                           {val}
                         </div>
                       </label>
                     );
                   })}
                 </div>
                 <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
                    <span>Mutlak Kiri</span>
                    <span>Sama</span>
                    <span>Mutlak Kanan</span>
                 </div>
               </div>
             );
          })}
        </div>
      </div>

      {/* VALIDATION FOOTER */}
<div className="mt-10 p-5 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-colors"
        style={{
           backgroundColor: !isComparisonComplete ? '#f8fafc' : (crResult.consistent ? '#f0fdf4' : '#fef2f2'),
           borderColor: !isComparisonComplete ? '#e2e8f0' : (crResult.consistent ? '#22c55e' : '#ef4444')
        }}
      >
        <div className="text-sm">
            <span className="block font-bold text-slate-700">Validitas Data (CR)</span>
            {!isComparisonComplete ? (
                <span className="text-slate-500">Lengkapi semua perbandingan.</span>
            ) : (
                <span className={`${crResult.consistent ? 'text-green-600' : 'text-red-600'} font-mono font-bold`}>
                    {(crResult.cr * 100).toFixed(1)}% {crResult.consistent ? '(Valid)' : '(Tidak Konsisten)'}
                </span>
            )}
        </div>

        <div className="flex gap-3">
            <button onClick={onBack} className="px-5 py-2 rounded-lg font-semibold text-slate-500 hover:bg-slate-100">
                Kembali
            </button>
            <button 
                onClick={handleSave} 
                disabled={!isPreRankingComplete || !isComparisonComplete || !crResult.consistent}
                className={`px-8 py-3 rounded-lg font-bold shadow-md transition-all
                    ${(!isPreRankingComplete || !isComparisonComplete || !crResult.consistent)
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-blue-900 text-white hover:bg-blue-800 hover:-translate-y-1'
                    }
                `}
            >
                {crResult.consistent ? "Simpan & Lanjut" : "Perbaiki Logika"}
            </button>
        </div>
      </div>
      
      {!crResult.consistent && isComparisonComplete && (
        <p className="text-center text-red-500 text-xs mt-2 font-semibold animate-pulse">
            CR &gt; 10%. Mohon periksa kembali logika jawaban Anda.
        </p>
      )}
    </div>
  );
};