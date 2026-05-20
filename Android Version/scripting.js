// scripting.js
function hitungStatistik(dataKegiatan) {
  let skorArray = dataKegiatan.map(k => k.skorPrioritas);
  let totalKegiatan = skorArray.length;
  if (totalKegiatan === 0) return {
    totalKegiatan: 0, rataRata: "0.00", median: "0.00", modus: "Tidak ada",
    standarDeviasi: "0.00", probabilitasKeterlambatan: "0.00%",
    tugasTerlambatAbsolut: 0, produktivitasMingguan: "0%",
    dataPieChart: { "TERLEWAT": 0, "Sangat Tinggi": 0, "Tinggi": 0, "Sedang": 0, "Rendah": 0 },
    dataBarChart: { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0 }
  };

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
  let standarDeviasi = 0;
  if (totalKegiatan > 1) {
    let variance = skorArray.reduce((acc, val) => acc + Math.pow(val - rataRata, 2), 0) / (totalKegiatan - 1);
    standarDeviasi = Math.sqrt(variance);
  }

  // 5. Probabilitas & Tugas Terlambat
  let pernahTerlambat = dataKegiatan.filter(k => !k.riwayatTerlambat.toLowerCase().includes('tidak')).length;
  let probKeterlambatan = (pernahTerlambat / totalKegiatan) * 100;
  let tugasTerlambatAktual = dataKegiatan.filter(k => k.tenggatAngka < 0 || k.labelPrioritas === "TERLEWAT").length;

  // 6. Data Dashboard (Pie & Bar)
  let proporsiPrioritas = { "TERLEWAT": 0, "Sangat Tinggi": 0, "Tinggi": 0, "Sedang": 0, "Rendah": 0 };
  let aktivitasHarian = { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0 };
  let tugasSelesai = 0;

  dataKegiatan.forEach(k => {
    if (proporsiPrioritas[k.labelPrioritas] !== undefined) proporsiPrioritas[k.labelPrioritas] += 1;
    if (k.status === "Selesai" && k.hariSelesai) {
      if (aktivitasHarian[k.hariSelesai] !== undefined) {
        aktivitasHarian[k.hariSelesai] += 1;
      }
      tugasSelesai += 1;
    }
  });

  return {
    totalKegiatan: totalKegiatan,
    rataRata: rataRata.toFixed(2),
    median: median.toFixed(2),
    modus: modus.length === totalKegiatan ? "Tidak ada" : modus.join(', '),
    standarDeviasi: standarDeviasi.toFixed(2),
    probabilitasKeterlambatan: probKeterlambatan.toFixed(2) + "%",
    tugasTerlambatAbsolut: tugasTerlambatAktual,
    produktivitasMingguan: totalKegiatan > 0 ? Math.round((tugasSelesai / totalKegiatan) * 100) + "%" : "0%",
    dataPieChart: proporsiPrioritas,
    dataBarChart: aktivitasHarian
  };
}

window.hitungStatistik = hitungStatistik;