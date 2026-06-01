window.taskData = [];

window.loadTaskData = async function () {
  try {
    const module = await import('../database/supabaseclient.js');
    const supabase = module.supabase;

    const { data, error } = await supabase.from('kegiatan').select('*');

    if (error) {
      console.error("Error fetching data:", error.message);
      return [];
    }

    if (data) {
      window.taskData = data.map(item => {
        let tenggatAngka = 7;

        if (item.tenggat_waktu) {
          const targetDate = new Date(item.tenggat_waktu);
          targetDate.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const diffTime = targetDate - today;
          tenggatAngka = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
          id: item.id,
          nama: item.nama_kegiatan || "Tanpa Nama",
          jenis: item.jenis_kegiatan || "Individu",
          kategori: item.kategori || "Tugas",
          tenggatAngka: tenggatAngka,
          tingkatKesulitan: item.tingkat_kesulitan || 3,
          riwayatTerlambat: item.pernah_terlambat || "Tidak",
          hariSelesai: item.hari_selesai,
          status: item.status || "Belum"
        };
      });

    }

  } catch (err) {
    console.error("Gagal menginisiasi Supabase client:", err);
    window.taskData = [];
  }

  return window.taskData;
};