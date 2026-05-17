// Uses window.kalkulasiDanUrutkan and window.hitungStatistik
window.initApp = function() {
  // Always reload from localStorage to get latest data
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedData = localStorage.getItem('taskData');
    if (storedData) {
      const freshData = JSON.parse(storedData);
      window.taskData.length = 0;
      freshData.forEach(item => window.taskData.push(item));
    }
  }

  console.log("\n=== 1. DAFTAR KEGIATAN & RANKING PRIORITAS LENGKAP ===");
  let dataTersortir = window.kalkulasiDanUrutkan();

  let tabelOutput = {};

  dataTersortir.forEach((k, index) => {
    let rekomendasi = "";
    if (k.labelPrioritas === "Sangat Tinggi") rekomendasi = "⚡ Kerjakan SEKARANG!";
    else if (k.labelPrioritas === "Tinggi") rekomendasi = "📋 Jadwalkan hari ini/besok";
    else if (k.labelPrioritas === "Sedang") rekomendasi = "📅 Rencanakan minggu ini";
    else rekomendasi = "🕐Bisa ditunda, tapi tetap liat deadlinenya";

    tabelOutput[index + 1] = {
      "Nama Kegiatan": k.nama,
      "Jenis": k.jenis,
      "Kategori": k.kategori,
      "Deadline": k.tenggatHari,
      "SKS": k.bebanSKS,
      "Kesulitan": k.tingkatKesulitan,
      "Riwayat": k.riwayatTerlambat,
      "Status": k.status,
      "Total Skor": k.skorPrioritas,
      "Label Prioritas": k.labelPrioritas,
      "Rekomendasi": rekomendasi
    };
  });

  console.table(tabelOutput);
  let hasilStatistik = window.hitungStatistik(dataTersortir);

  console.log("-> Total Kegiatan            : ", hasilStatistik.totalKegiatan);
  console.log("-> Rata-rata (Mean)          : ", hasilStatistik.rataRata);
  console.log("-> Nilai Tengah (Median)     : ", hasilStatistik.median);
  console.log("-> Nilai Sering Muncul(Modus): ", hasilStatistik.modus);
  console.log("-> Standar Deviasi           : ", hasilStatistik.standarDeviasi);
  console.log("-> Probabilitas Terlambat    : ", hasilStatistik.probabilitasKeterlambatan);
  console.log("-> Tugas Terlambat (Absolut) : ", hasilStatistik.tugasTerlambatAbsolut);
  console.log("-> Produktivitas Mingguan    : ", hasilStatistik.produktivitasMingguan);
  console.log("-> Proporsi Pie Chart        : ", hasilStatistik.dataPieChart);
  console.log("-> Proporsi Bar Chart Hari   : ", hasilStatistik.dataBarChart);
  
  return { dataTersortir, hasilStatistik };
};