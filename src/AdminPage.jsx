import React, { useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';

// --- DEFINISI KONSTANTA FAKTOR ---
// Urutan ini PENTING untuk rekonstruksi matriks AHP
const DATA_STRUCTURE = {
  'TOE': {
    name: 'TOE',
    factors: ['Technology', 'Organization', 'Environment'],
    pairs: [
      ['Technology', 'Organization'],
      ['Organization', 'Environment'],
      ['Technology', 'Environment']
    ]
  },
  'TECH': {
    name: 'Technology',
    factors: ['IT Infrastructure', 'Data Security', 'System Compatibility'],
    pairs: [
      ['IT Infrastructure', 'Data Security'],
      ['Data Security', 'System Compatibility'],
      ['IT Infrastructure', 'System Compatibility']
    ]
  },
  'ORG': {
    name: 'Organization',
    factors: ['Leadership Support', 'Employee Readiness', 'Governance Structure'],
    pairs: [
      ['Leadership Support', 'Employee Readiness'],
      ['Employee Readiness', 'Governance Structure'],
      ['Leadership Support', 'Governance Structure']
    ]
  },
  'ENV': {
    name: 'Environment',
    factors: ['Government Policies', 'Vendor Ecosystem', 'Stakeholder Pressure'],
    pairs: [
      ['Government Policies', 'Vendor Ecosystem'],
      ['Vendor Ecosystem', 'Stakeholder Pressure'],
      ['Government Policies', 'Stakeholder Pressure']
    ]
  }
};

const AdminPage = () => {
  const [loading, setLoading] = useState(null); // null, 'TOE', 'TECH', 'ORG', 'ENV'

  // --- ENGINE PERHITUNGAN AHP (Sama seperti di Survey Page) ---
  const calculateEigenValues = (comparisons, factorList) => {
    if (!comparisons) return {};

    const n = 3;
    const matrix = [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ];

    // 1. Rekonstruksi Matriks dari Data Firestore
    // Kita harus mencari nilai pair di object comparisons (misal: "Technology vs Organization")
    factorList.forEach((rowFactor, i) => {
      factorList.forEach((colFactor, j) => {
        if (i === j) return; // Diagonal tetap 1

        // Cek key forward: "A vs B"
        let val = comparisons[`${rowFactor} vs ${colFactor}`];
        if (val !== undefined) {
          matrix[i][j] = val;
          matrix[j][i] = 1 / val;
          return;
        }

        // Cek key backward: "B vs A" (Jaga-jaga kalau key terbalik)
        val = comparisons[`${colFactor} vs ${rowFactor}`];
        if (val !== undefined) {
          matrix[i][j] = 1 / val;
          matrix[j][i] = val;
        }
      });
    });

    // 2. Hitung Penjumlahan Kolom
    const colSums = [0, 0, 0];
    matrix.forEach(row => row.forEach((val, j) => colSums[j] += val));

    // 3. Hitung Priority Vector (Eigen Value)
    const priorities = {};
    factorList.forEach((factor, i) => {
      // Rumus: Rata-rata dari (Baris / Total Kolom)
      let rowSum = 0;
      for (let j = 0; j < n; j++) {
        rowSum += matrix[i][j] / colSums[j];
      }
      priorities[factor] = rowSum / n;
    });

    return priorities;
  };

  // --- FUNGSI EXPORT UTAMA ---
  const handleExport = async (categoryKey) => {
    setLoading(categoryKey);
    try {
      // 1. Ambil Data
      const querySnapshot = await getDocs(collection(db, "survei_ahp"));
      if (querySnapshot.empty) {
        alert("Belum ada data.");
        return;
      }

      const categoryConfig = DATA_STRUCTURE[categoryKey];
      const rows = [];

      // 2. Loop Dokumen & Flattening
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const surveyData = data.survey_results?.[categoryKey]; // Ambil subset data (misal ENV saja)
        
        // Base Row (Identitas)
        const row = {
          'nama': data.respondent?.name || '-',
          'jabatan': data.respondent?.job || '-',
          'tanggal': data.submittedAt?.seconds 
            ? new Date(data.submittedAt.seconds * 1000).toLocaleString('id-ID')
            : '-'
        };

        if (surveyData) {
          // A. Masukkan Pairwise Comparison Values
          // Format Key: TOE_Technology_vs_Organization
          categoryConfig.pairs.forEach(([f1, f2]) => {
            const pairKey = `${f1} vs ${f2}`;
            const val = surveyData.comparisons?.[pairKey];
            const colName = `${categoryKey}_${f1}_vs_${f2}`.replace(/\s/g, '_'); // Ganti spasi dgn _
            
            row[colName] = val !== undefined ? val : '';
          });

          // B. Hitung & Masukkan Eigen Values
          const eigenValues = calculateEigenValues(surveyData.comparisons, categoryConfig.factors);
          
          categoryConfig.factors.forEach(factor => {
            const colName = `eigen value ${categoryKey}_${factor}`.replace(/\s/g, '_'); // Format: eigen_value_TOE_Technology
            // Format angka desimal (misal 0.634)
            row[colName] = eigenValues[factor] !== undefined ? eigenValues[factor].toFixed(4) : '0';
          });
        }

        rows.push(row);
      });

      // 3. Generate CSV
      generateCSV(rows, `export_${categoryKey}_${new Date().toISOString().slice(0,10)}.csv`);

    } catch (error) {
      console.error(error);
      alert("Gagal export data.");
    } finally {
      setLoading(null);
    }
  };

  const generateCSV = (data, filename) => {
    if (data.length === 0) return;
    
    // Ambil header dari row pertama
    const headers = Object.keys(data[0]);
    let csvContent = headers.join(",") + "\n";

    data.forEach(row => {
      const rowString = headers.map(header => {
        let cell = row[header] === undefined ? "" : row[header];
        cell = cell.toString().replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
        return cell;
      }).join(",");
      csvContent += rowString + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-500">Download Rekapitulasi Data Survei AHP</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Button 1: TOE */}
          <ExportButton 
            label="Export TOE Context" 
            subLabel="(Technology, Organization, Environment)"
            onClick={() => handleExport('TOE')}
            isLoading={loading === 'TOE'}
            color="bg-blue-600 hover:bg-blue-700"
          />

          {/* Button 2: Technology */}
          <ExportButton 
            label="Export Technology Factor" 
            subLabel="(Infra, Security, Compatibility)"
            onClick={() => handleExport('TECH')}
            isLoading={loading === 'TECH'}
            color="bg-indigo-600 hover:bg-indigo-700"
          />

          {/* Button 3: Organization */}
          <ExportButton 
            label="Export Organization Factor" 
            subLabel="(Leadership, Readiness, Governance)"
            onClick={() => handleExport('ORG')}
            isLoading={loading === 'ORG'}
            color="bg-purple-600 hover:bg-purple-700"
          />

          {/* Button 4: Environment */}
          <ExportButton 
            label="Export Environment Factor" 
            subLabel="(Policy, Vendor, Stakeholder)"
            onClick={() => handleExport('ENV')}
            isLoading={loading === 'ENV'}
            color="bg-emerald-600 hover:bg-emerald-700"
          />

        </div>

        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
          <strong>Keterangan Kolom CSV:</strong>
          <ul className="list-disc ml-4 mt-1 space-y-1">
            <li><strong>nama, jabatan, tanggal:</strong> Identitas responden.</li>
            <li><strong>[KATEGORI]_A_vs_B:</strong> Nilai perbandingan (Skala 1-9).</li>
            <li><strong>eigen_value_[FAKTOR]:</strong> Bobot prioritas hasil perhitungan AHP otomatis (0.0 - 1.0).</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

// Komponen Tombol Kecil agar rapi
const ExportButton = ({ label, subLabel, onClick, isLoading, color }) => (
  <button 
    onClick={onClick}
    disabled={isLoading}
    className={`${color} text-white p-4 rounded-xl shadow-md transition-all transform hover:-translate-y-1 flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed h-24`}
  >
    {isLoading ? (
      <Loader2 className="animate-spin" size={24} />
    ) : (
      <>
        <div className="flex items-center gap-2 font-bold text-lg">
          <FileSpreadsheet size={20} /> {label}
        </div>
        <span className="text-xs opacity-80 font-light">{subLabel}</span>
      </>
    )}
  </button>
);

export default AdminPage;