const initialData = [
  { id: 1, nama: "Project Akhir Web", jenis: "Kelompok", kategori: "UAS", tenggatAngka: 2, bebanSKS: 4, tingkatKesulitan: 5, riwayatTerlambat: "Tidak Pernah", hariSelesai: "Mon", status: "Selesai" },
  { id: 2, nama: "Rapat Divisi Acara", jenis: "Kelompok", kategori: "Organisasi", tenggatAngka: 5, bebanSKS: 0, tingkatKesulitan: 3, riwayatTerlambat: "Pernah Terlambat", hariSelesai: "Wed", status: "Selesai" },
  { id: 3, nama: "Kuis Jaringan", jenis: "Individu", kategori: "Ujian", tenggatAngka: 10, bebanSKS: 3, tingkatKesulitan: 4, riwayatTerlambat: "Tidak Pernah", hariSelesai: null, status: "Belum" },
  { id: 4, nama: "Seminar Eksternal", jenis: "Individu", kategori: "Kegiatan eksternal", tenggatAngka: 20, bebanSKS: 0, tingkatKesulitan: 2, riwayatTerlambat: "Tidak Pernah", hariSelesai: null, status: "Belum" },
  { id: 5, nama: "Tugas Matdis", jenis: "Individu", kategori: "Tugas", tenggatAngka: 1, bebanSKS: 3, tingkatKesulitan: 4, riwayatTerlambat: "Pernah Terlambat", hariSelesai: "Thu", status: "Selesai" },
  { id: 6, nama: "Laporan Praktikum", jenis: "Individu", kategori: "Tugas", tenggatAngka: 4, bebanSKS: 1, tingkatKesulitan: 3, riwayatTerlambat: "Tidak Pernah", hariSelesai: null, status: "Belum" },
  { id: 7, nama: "Revisi Skripsi", jenis: "Individu", kategori: "UAS", tenggatAngka: -1, bebanSKS: 6, tingkatKesulitan: 5, riwayatTerlambat: "Pernah Terlambat", hariSelesai: null, status: "Belum" },
  { id: 8, nama: "Latihan Organisasi", jenis: "Kelompok", kategori: "Organisasi", tenggatAngka: 20, bebanSKS: 0, tingkatKesulitan: 2, riwayatTerlambat: "Tidak Pernah", hariSelesai: null, status: "Belum" },
  { id: 9, nama: "Persiapan Lomba", jenis: "Kelompok", kategori: "Kegiatan eksternal", tenggatAngka: 12, bebanSKS: 0, tingkatKesulitan: 4, riwayatTerlambat: "Tidak Pernah", hariSelesai: null, status: "Belum" },
  { id: 10, nama: "Ujian Susulan", jenis: "Individu", kategori: "Ujian", tenggatAngka: 4, bebanSKS: 3, tingkatKesulitan: 4, riwayatTerlambat: "Pernah Terlambat", hariSelesai: null, status: "Belum" }
];

let data = [];
if (typeof window !== 'undefined' && window.localStorage) {
  const storedData = localStorage.getItem('taskData');
  let parsed = storedData ? JSON.parse(storedData) : null;
  // Use initialData if nothing is stored OR stored array is empty
  if (parsed && Array.isArray(parsed) && parsed.length > 0) {
    data = parsed;
  } else {
    data = [...initialData];
    localStorage.setItem('taskData', JSON.stringify(data));
  }
} else {
  data = [...initialData];
}

window.taskData = data;