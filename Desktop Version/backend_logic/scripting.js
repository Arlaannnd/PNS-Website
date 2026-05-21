// scripting.js
function hitungStatistik(dataKegiatan) {
  let skorArray = dataKegiatan.map(k => k.skorPrioritas);
  let totalKegiatan = skorArray.length;
  if (totalKegiatan < 2) return null;

  // 1. Mean (Rata-rata)
  let sum = skorArray.reduce((acc, val) => acc + val, 0);
  let rataRata = sum / totalKegiatan;

  // 2. Median
  let sorted = [...skorArray].sort((a, b) => a - b);
  let mid = Math.floor(totalKegiatan / 2);
  let median = totalKegiatan % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  // 3. Modus
  let frekuensi = {};
  let maxFreq = 0;
  let modus = [];
  skorArray.forEach(skor => {
    frekuensi[skor] = (frekuensi[skor] || 0) + 1;
    if (frekuensi[skor] > maxFreq) maxFreq = frekuensi[skor];
  });
  for (let key in frekuensi) {
    if (frekuensi[key] === maxFreq) modus.push(Number(key));
  }

  // 4. Standar Deviasi (Rumus Sampel n-1 agar sesuai Excel STDEV.S)
  let variance = skorArray.reduce((acc, val) => acc + Math.pow(val - rataRata, 2), 0) / (totalKegiatan - 1);
  let standarDeviasi = Math.sqrt(variance);

  // 5. Probabilitas & Tugas Terlambat
  // Tugas terlambat = tugas yang tenggatAngka < 0 (sudah melewati deadline) atau labelPrioritas TERLEWAT
  let tugasTerlambat = dataKegiatan.filter(k => k.tenggatAngka < 0 || k.labelPrioritas === "TERLEWAT").length;
  let pernahTerlambat = dataKegiatan.filter(k => !k.riwayatTerlambat.toLowerCase().includes('tidak')).length;
  let probKeterlambatan = (pernahTerlambat / totalKegiatan) * 100;

  // 6. Data Dashboard (Pie & Bar)
  // Pie chart uses actual label categories from ruleEngine
  let proporsiPrioritas = { "TERLEWAT": 0, "Sangat Tinggi": 0, "Tinggi": 0, "Sedang": 0, "Rendah": 0 };
  let aktivitasHarian = { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0 };
  let tugasSelesai = 0;

  dataKegiatan.forEach(k => {
    if (proporsiPrioritas[k.labelPrioritas] !== undefined) {
      proporsiPrioritas[k.labelPrioritas] += 1;
    }
    if (k.status === "Selesai") {
      tugasSelesai += 1;
      if (k.hariSelesai && aktivitasHarian[k.hariSelesai] !== undefined) {
        aktivitasHarian[k.hariSelesai] += 1;
      }
    }
  });

  // Produktivitas mingguan = persentase tugas selesai dari total
  let produktivitasPct = totalKegiatan > 0 ? Math.round((tugasSelesai / totalKegiatan) * 100) : 0;

  // Rata-rata waktu penyelesaian (hari) - hitung berdasarkan tugas selesai
  let totalWaktu = 0;
  let jumlahSelesai = 0;
  dataKegiatan.forEach(k => {
    if (k.status === "Selesai") {
      // Estimasi waktu penyelesaian berdasarkan tenggatAngka
      // Semakin kecil tenggatAngka saat diselesaikan = semakin cepat
      totalWaktu += Math.max(1, Math.abs(k.tenggatAngka));
      jumlahSelesai++;
    }
  });
  let rataRataWaktu = jumlahSelesai > 0 ? (totalWaktu / jumlahSelesai) : 0;

  return {
    totalKegiatan: totalKegiatan,
    rataRata: rataRata.toFixed(2),
    median: median.toFixed(2),
    modus: modus.length === totalKegiatan ? "Tidak ada" : modus.join(', '),
    standarDeviasi: standarDeviasi.toFixed(2),
    probabilitasKeterlambatan: probKeterlambatan.toFixed(2) + "%",
    tugasTerlambatAbsolut: tugasTerlambat,
    produktivitasMingguan: produktivitasPct + "%",
    produktivitasAngka: produktivitasPct,
    tugasSelesai: tugasSelesai,
    rataRataWaktu: rataRataWaktu.toFixed(1),
    dataPieChart: proporsiPrioritas,
    dataBarChart: aktivitasHarian
  };
}

window.hitungStatistik = hitungStatistik;