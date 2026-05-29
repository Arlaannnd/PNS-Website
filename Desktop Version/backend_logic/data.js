window.taskData = [];

window.loadTaskData = async function() {
  try {
    // PERBAIKAN 1: Path yang benar menyesuaikan letak HTML di folder root
    const module = await import('../database/supabaseclient.js');
    const supabase = module.supabase;

    // Mengambil semua data kegiatan dari Supabase
    const { data, error } = await supabase.from('kegiatan').select('*');
    
    if (error) {
      console.error("Error fetching data:", error.message);
      return [];
    }

    if (data) {
      window.taskData = data.map(item => {
        let tenggatAngka = 7; 
        
        // Konversi format Date Supabase menjadi selisih hari
        if (item.tenggat_waktu) {
            const targetDate = new Date(item.tenggat_waktu);
            // Normalisasi jam ke tengah malam agar perhitungan hari tidak selisih
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
          bebanSKS: item.beban_sks || 2, 
          tingkatKesulitan: item.tingkat_kesulitan || 3,
          riwayatTerlambat: item.pernah_terlambat || "Tidak",
          hariSelesai: item.hari_selesai,
          status: item.status || "Belum"
        };
      });

      // PERBAIKAN 2: Simpan bayangan data ke localStorage
      // Ini akan membuat Lonceng Notifikasi & Modal Edit kamu berfungsi normal kembali!
      localStorage.setItem('taskData', JSON.stringify(window.taskData));
    }

  } catch (err) {
    console.error("Gagal menginisiasi Supabase client:", err);
    window.taskData = [];
  }
  
  return window.taskData;
};