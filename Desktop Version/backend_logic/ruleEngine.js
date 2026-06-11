function getPoinTenggat(tenggatAngka) {
    if (typeof tenggatAngka !== "number") return 6;
    if (tenggatAngka < 0) return 150;
    if (tenggatAngka < 3) return 25;
    if (tenggatAngka <= 7) return 18;
    if (tenggatAngka <= 14) return 12;
    return 6;
}

function getFormatTenggat(tenggatAngka) {
    if (typeof tenggatAngka !== "number") return "-";
    if (tenggatAngka < 0) return "Terlewat";
    return tenggatAngka + " hari";
}

function getPoinKategori(kategori) {
    let kat = kategori.toLowerCase();
    if (kat.includes("tugas") || kat.includes("ujian") || kat.includes("uts") || kat.includes("uas")) {
        return 25;
    }
    if (kat.includes("organisasi") || kat.includes("kepanitiaan")) {
        return 15;
    }
    if (kat.includes("eksternal")) return 10;
    return 10;
}

function getPoinJenis(jenis) {
    return jenis.toLowerCase() === "kelompok" ? 15 : 5;
}

function getPoinKesulitan(tingkat) {
    return tingkat * 4;
}

function getPoinRiwayat(riwayat) {
    return riwayat.toLowerCase().includes("tidak") ? 0 : 15;
}

function tentukanLabel(skor) {
    if (skor >= 150) return "TERLEWAT";
    if (skor >= 75) return "Sangat Tinggi";
    if (skor >= 55) return "Tinggi";
    if (skor >= 40) return "Sedang";
    return "Rendah";
}

function hitungPrioritas(kegiatan) {
    let poinTenggat = getPoinTenggat(kegiatan.tenggatAngka);
    let poinKategori = getPoinKategori(kegiatan.kategori);
    let poinJenis = getPoinJenis(kegiatan.jenis);
    let poinKesulitan = getPoinKesulitan(kegiatan.tingkatKesulitan);
    let poinRiwayat = getPoinRiwayat(kegiatan.riwayatTerlambat);
    kegiatan.tenggatHari = getFormatTenggat(kegiatan.tenggatAngka);
    let totalSkor = poinTenggat + poinKategori + poinJenis + poinKesulitan + poinRiwayat;

    return {
        skor: totalSkor,
        label: tentukanLabel(totalSkor)
    };
}

function kalkulasiDanUrutkan() {
    window.taskData.forEach(kegiatan => {
        let hasil = hitungPrioritas(kegiatan);
        kegiatan.skorPrioritas = hasil.skor;
        kegiatan.labelPrioritas = hasil.label;
    });

    return window.taskData.sort((a, b) => b.skorPrioritas - a.skorPrioritas);
}
window.kalkulasiDanUrutkan = kalkulasiDanUrutkan;
window.hitungPrioritas = hitungPrioritas;