window.initApp = async function () {
    if (window.loadTaskData && (!window.taskData || window.taskData.length === 0)) {
        await window.loadTaskData();
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

    return { dataTersortir, hasilStatistik };
};

window.mulaiKegiatan = async function (taskId) {
    const task = window.taskData.find(t => t.id === taskId);
    if (!task) return;

    const confirmResult = await window.showCustomModal({
        title: "Mulai Kegiatan",
        message: `Mulai mengerjakan "${task.nama}" sekarang? Timer akan berjalan.`,
        type: 'confirm',
        confirmText: "Mulai Sekarang"
    });
    if (!confirmResult) return;

    try {
        const supabase = await window.authService.getSupabase();
        const nowIso = new Date().toISOString();
        const { error } = await supabase
            .from('kegiatan')
            .update({ waktu_mulai: nowIso })
            .eq('id', taskId);

        if (error) throw error;

        sessionStorage.setItem('activeTimerTaskId', taskId);

        // --- LOCAL NOTIFICATION LOGIC ---
        if (typeof window.Capacitor !== 'undefined' && window.Capacitor.Plugins.LocalNotifications) {
            try {
                const { LocalNotifications } = window.Capacitor.Plugins;
                await LocalNotifications.requestPermissions();
                
                // Daftarkan Action Type untuk tombol 'Selesai'
                await LocalNotifications.registerActionTypes({
                    types: [{
                        id: 'TASK_ACTIONS',
                        actions: [{ id: 'finish', title: 'Selesai' }]
                    }]
                });

                // Jadwalkan notifikasi agar muncul
                await LocalNotifications.schedule({
                    notifications: [{
                        title: "Kegiatan Sedang Berjalan",
                        body: `Anda sedang mengerjakan: ${task.nama}`,
                        id: taskId,
                        schedule: { at: new Date(Date.now() + 1000) },
                        actionTypeId: 'TASK_ACTIONS',
                        extra: { taskId: taskId },
                        ongoing: true // Supaya notifikasi sulit di-swipe sembarangan
                    }]
                });
            } catch (notifErr) {
                console.error("Gagal menjadwalkan notifikasi:", notifErr);
            }
        }
        // --------------------------------

        await window.showCustomModal({
            title: "Berhasil",
            message: "Kegiatan dimulai! Timer sedang berjalan.",
            type: 'success',
            confirmText: "OK"
        });
        window.location.reload();
    } catch (err) {
        await window.showCustomModal({
            title: "Gagal",
            message: "Gagal memulai kegiatan: " + err.message,
            type: 'error',
            confirmText: "Tutup"
        });
        console.error(err);
    }
};

window.selesaikanKegiatanTimer = async function (taskId, skipConfirm = false) {
    const task = window.taskData.find(t => t.id === taskId);
    if (!task) return;

    if (!skipConfirm) {
        const confirmResult = await window.showCustomModal({
            title: "Selesaikan Kegiatan",
            message: `Selesaikan kegiatan "${task.nama}" dan hentikan timer?`,
            type: 'confirm',
            confirmText: "Selesaikan"
        });
        if (!confirmResult) return;
    }

    try {
        const supabase = await window.authService.getSupabase();

        let durasiTambahanDetik = 0;
        if (task.waktuMulai) {
            const startTime = new Date(task.waktuMulai);
            const now = new Date();
            durasiTambahanDetik = Math.floor((now - startTime) / 1000);
        }

        const totalDurasi = (task.durasiDetik || 0) + durasiTambahanDetik;
        const hariIniStr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];

        const { error } = await supabase
            .from('kegiatan')
            .update({
                status: "Selesai",
                hari_selesai: hariIniStr,
                waktu_mulai: null,
                durasi_detik: totalDurasi
            })
            .eq('id', taskId);

        if (error) throw error;

        // Bersihkan notifikasi jika ada
        if (typeof window.Capacitor !== 'undefined' && window.Capacitor.Plugins.LocalNotifications) {
            window.Capacitor.Plugins.LocalNotifications.cancel({ notifications: [{ id: taskId }] }).catch(e => console.error(e));
        }

        sessionStorage.removeItem('activeTimerTaskId');
        await window.showCustomModal({
            title: "Tugas Selesai",
            message: "Waktu pengerjaan telah berhasil direkam.",
            type: 'success',
            confirmText: "OK"
        });
        window.location.reload();
    } catch (err) {
        await window.showCustomModal({
            title: "Gagal",
            message: "Gagal menyelesaikan tugas: " + err.message,
            type: 'error',
            confirmText: "Tutup"
        });
        console.error(err);
    }
};

window.batalkanTimer = async function (taskId) {
    const task = window.taskData.find(t => t.id === taskId);
    if (!task) return;

    const confirmResult = await window.showCustomModal({
        title: "Hentikan Timer",
        message: `Hentikan timer untuk kegiatan "${task.nama}" tanpa menyelesaikannya? Waktu yang sudah berjalan akan disimpan.`,
        type: 'confirm',
        confirmText: "Hentikan Timer",
        cancelText: "Batal"
    });
    if (!confirmResult) return;

    try {
        const supabase = await window.authService.getSupabase();

        let durasiTambahanDetik = 0;
        if (task.waktuMulai) {
            const startTime = new Date(task.waktuMulai);
            const now = new Date();
            durasiTambahanDetik = Math.floor((now - startTime) / 1000);
        }

        const totalDurasi = (task.durasiDetik || 0) + durasiTambahanDetik;

        const { error } = await supabase
            .from('kegiatan')
            .update({
                waktu_mulai: null,
                durasi_detik: totalDurasi
            })
            .eq('id', taskId);

        if (error) throw error;

        // Bersihkan notifikasi jika ada
        if (typeof window.Capacitor !== 'undefined' && window.Capacitor.Plugins.LocalNotifications) {
            window.Capacitor.Plugins.LocalNotifications.cancel({ notifications: [{ id: taskId }] }).catch(e => console.error(e));
        }

        sessionStorage.removeItem('activeTimerTaskId');
        await window.showCustomModal({
            title: "Timer Dihentikan",
            message: "Waktu pengerjaan telah disimpan.",
            type: 'success',
            confirmText: "OK"
        });
        window.location.reload();
    } catch (err) {
        await window.showCustomModal({
            title: "Gagal",
            message: "Gagal menghentikan timer: " + err.message,
            type: 'error',
            confirmText: "Tutup"
        });
        console.error(err);
    }
};


// Registrasi Listener untuk Local Notification Action (ketika tombol 'Selesai' ditekan di Notifikasi)
if (typeof window.Capacitor !== 'undefined') {
    document.addEventListener("DOMContentLoaded", () => {
        if (window.Capacitor.Plugins.LocalNotifications) {
            window.Capacitor.Plugins.LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
                if (notificationAction.actionId === 'finish') {
                    const taskId = notificationAction.notification.extra.taskId;
                    if (taskId && typeof window.selesaikanKegiatanTimer === 'function') {
                        // Selesaikan tugas secara langsung tanpa pop-up konfirmasi
                        window.selesaikanKegiatanTimer(taskId, true);
                    }
                }
            });
        }
    });
}
