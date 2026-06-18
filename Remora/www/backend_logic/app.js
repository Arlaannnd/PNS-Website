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

    // Call dynamic notifications scheduling
    if (typeof window.scheduleDynamicNotifications === 'function') {
        window.scheduleDynamicNotifications(dataTersortir);
    }

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

                await LocalNotifications.registerActionTypes({
                    types: [
                        {
                            id: 'TASK_ACTIONS_PLAYING',
                            actions: [
                                { id: 'pause', title: 'Pause', foreground: false },
                                { id: 'finish', title: 'Selesai', foreground: false },
                                { id: 'cancel', title: 'Cancel', foreground: true }
                            ]
                        },
                        {
                            id: 'TASK_ACTIONS_PAUSED',
                            actions: [
                                { id: 'play', title: 'Play', foreground: false },
                                { id: 'finish', title: 'Selesai', foreground: false },
                                { id: 'cancel', title: 'Cancel', foreground: true }
                            ]
                        }
                    ]
                });

                await LocalNotifications.schedule({
                    notifications: [{
                        title: "Kegiatan Sedang Berjalan",
                        body: `Anda sedang mengerjakan: ${task.nama}`,
                        id: taskId,
                        schedule: { at: new Date(Date.now() + 1000) },
                        actionTypeId: 'TASK_ACTIONS_PLAYING',
                        extra: { taskId: taskId },
                        ongoing: true,
                        autoCancel: false
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

window.pauseKegiatanTimer = async function (taskId, fromNotification = false) {
    const task = window.taskData.find(t => t.id === taskId);
    if (!task) return;

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

        if (typeof window.Capacitor !== 'undefined' && window.Capacitor.Plugins.LocalNotifications) {
            window.Capacitor.Plugins.LocalNotifications.schedule({
                notifications: [{
                    title: "Kegiatan Dihentikan Sementara",
                    body: `Menunggu dilanjutkan: ${task.nama}`,
                    id: taskId,
                    schedule: { at: new Date(Date.now() + 1000) },
                    actionTypeId: 'TASK_ACTIONS_PAUSED',
                    extra: { taskId: taskId },
                    ongoing: true,
                    autoCancel: false
                }]
            }).catch(e => console.error(e));
        }

        // Memperbarui state lokal agar UI langsung merespon
        task.waktuMulai = null;
        task.durasiDetik = totalDurasi;

        // Perbarui banner tanpa memuat ulang aplikasi
        if (typeof window.checkActiveTimer === 'function') {
            window.checkActiveTimer();
        }

        // Perbarui UI lain jika ada fungsi refresh
        if (typeof window.renderTugasUI === 'function') {
            window.renderTugasUI();
        }
    } catch (err) {
        console.error("Gagal menghentikan timer sementara: ", err);
    }
};

window.resumeKegiatanTimer = async function (taskId, fromNotification = false) {
    const task = window.taskData.find(t => t.id === taskId);
    if (!task) return;

    try {
        const supabase = await window.authService.getSupabase();
        const nowIso = new Date().toISOString();
        const { error } = await supabase
            .from('kegiatan')
            .update({ waktu_mulai: nowIso })
            .eq('id', taskId);

        if (error) throw error;

        sessionStorage.setItem('activeTimerTaskId', taskId);

        if (typeof window.Capacitor !== 'undefined' && window.Capacitor.Plugins.LocalNotifications) {
            window.Capacitor.Plugins.LocalNotifications.schedule({
                notifications: [{
                    title: "Kegiatan Sedang Berjalan",
                    body: `Anda sedang mengerjakan: ${task.nama}`,
                    id: taskId,
                    schedule: { at: new Date(Date.now() + 1000) },
                    actionTypeId: 'TASK_ACTIONS_PLAYING',
                    extra: { taskId: taskId },
                    ongoing: true,
                    autoCancel: false
                }]
            }).catch(e => console.error(e));
        }

        // Memperbarui state lokal agar UI langsung merespon
        task.waktuMulai = nowIso;

        // Perbarui banner tanpa memuat ulang aplikasi
        if (typeof window.checkActiveTimer === 'function') {
            window.checkActiveTimer();
        }

        // Perbarui UI lain jika ada fungsi refresh
        if (typeof window.renderTugasUI === 'function') {
            window.renderTugasUI();
        }
    } catch (err) {
        console.error("Gagal melanjutkan timer: ", err);
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

        if (typeof window.Capacitor !== 'undefined' && window.Capacitor.Plugins.LocalNotifications) {
            window.Capacitor.Plugins.LocalNotifications.cancel({ notifications: [{ id: taskId }] }).catch(e => console.error(e));
        }

        sessionStorage.removeItem('activeTimerTaskId');

        if (!skipConfirm) {
            await window.showCustomModal({
                title: "Tugas Selesai",
                message: "Waktu pengerjaan telah berhasil direkam.",
                type: 'success',
                confirmText: "OK"
            });
            window.location.reload();
        } else {
            task.status = "Selesai";
            task.waktuMulai = null;

            if (typeof window.checkActiveTimer === 'function') {
                window.checkActiveTimer();
            }
            if (typeof window.renderTugasUI === 'function') {
                window.renderTugasUI();
            }
        }
    } catch (err) {
        if (!skipConfirm) {
            await window.showCustomModal({
                title: "Gagal",
                message: "Gagal menyelesaikan tugas: " + err.message,
                type: 'error',
                confirmText: "Tutup"
            });
        }
        console.error(err);
    }
};

window.batalkanTimer = async function (taskId) {
    const task = window.taskData.find(t => t.id === taskId);
    if (!task) return;

    const confirmResult = await window.showCustomModal({
        title: "Batalkan Timer",
        message: `Apakah Anda yakin ingin membatalkan timer "${task.nama}"? Waktu pengerjaan saat ini tidak akan disimpan.`,
        type: 'confirm',
        confirmText: "Ya, Batalkan",
        cancelText: "Batal"
    });
    if (!confirmResult) return;

    try {
        const supabase = await window.authService.getSupabase();

        const { error } = await supabase
            .from('kegiatan')
            .update({
                waktu_mulai: null
            })
            .eq('id', taskId);

        if (error) throw error;

        if (typeof window.Capacitor !== 'undefined' && window.Capacitor.Plugins.LocalNotifications) {
            window.Capacitor.Plugins.LocalNotifications.cancel({ notifications: [{ id: taskId }] }).catch(e => console.error(e));
        }

        sessionStorage.removeItem('activeTimerTaskId');
        await window.showCustomModal({
            title: "Timer Dibatalkan",
            message: "Waktu pengerjaan tidak direkam.",
            type: 'success',
            confirmText: "OK"
        });
        window.location.reload();
    } catch (err) {
        await window.showCustomModal({
            title: "Gagal",
            message: "Gagal membatalkan timer: " + err.message,
            type: 'error',
            confirmText: "Tutup"
        });
        console.error(err);
    }
};

// Registrasi Listener untuk Local Notification Actions
if (typeof window.Capacitor !== 'undefined') {
    document.addEventListener("DOMContentLoaded", () => {
        if (window.Capacitor.Plugins.LocalNotifications) {
            window.Capacitor.Plugins.LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
                const taskId = notificationAction.notification.extra.taskId;
                if (!taskId) return;

                if (notificationAction.actionId === 'finish') {
                    if (typeof window.selesaikanKegiatanTimer === 'function') {
                        window.selesaikanKegiatanTimer(taskId, true);
                    }
                } else if (notificationAction.actionId === 'pause') {
                    if (typeof window.pauseKegiatanTimer === 'function') {
                        window.pauseKegiatanTimer(taskId, true);
                    }
                } else if (notificationAction.actionId === 'play') {
                    if (typeof window.resumeKegiatanTimer === 'function') {
                        window.resumeKegiatanTimer(taskId, true);
                    }
                } else if (notificationAction.actionId === 'cancel') {
                    if (typeof window.batalkanTimer === 'function') {
                        window.batalkanTimer(taskId);
                    }
                }
            });
        }
    });
}

// Global Dynamic Notifications Scheduler
window.scheduleDynamicNotifications = async function (dataTersortir) {
    if (typeof window.Capacitor === 'undefined' || !window.Capacitor.Plugins.LocalNotifications) {
        return;
    }

    try {
        const { LocalNotifications } = window.Capacitor.Plugins;
        await LocalNotifications.requestPermissions();

        // Ambil notifikasi yang sudah terjadwal
        const pending = await LocalNotifications.getPending();

        // Batalkan notifikasi dinamis sebelumnya (ID >= 100000) untuk menghindari duplikasi
        const notificationsToCancel = pending.notifications
            .filter(n => parseInt(n.id) >= 100000)
            .map(n => ({ id: n.id }));

        if (notificationsToCancel.length > 0) {
            await LocalNotifications.cancel({ notifications: notificationsToCancel });
        }

        // Ambil pengaturan notifikasi pengguna
        const { data: profile } = await window.authService.getProfile();
        const allowDeadline = profile && profile.t_deadline !== undefined ? profile.t_deadline : true;
        const allowPrioritas = profile && profile.t_prioritas !== undefined ? profile.t_prioritas : true;
        const tWeeklyStr = localStorage.getItem('t-weekly');
        const allowWeekly = tWeeklyStr === 'true'; // Default sesuai UI adalah off

        const newNotifications = [];

        // Hanya tugas yang belum selesai
        const activeTasks = dataTersortir.filter(k => k.status !== "Selesai");

        activeTasks.forEach(task => {
            // Gunakan ID unik berdasarkan ID tugas, atau random jika tidak valid
            const taskIdInt = parseInt(task.id) || Math.floor(Math.random() * 90000) + 10000;

            // Kondisi 1: Deadline < 3 hari
            if (allowDeadline && task.tenggatAngka !== undefined && task.tenggatAngka >= 0 && task.tenggatAngka <= 3) {
                newNotifications.push({
                    title: "Peringatan Deadline Dekat!",
                    body: `Kegiatan "${task.nama}" memiliki tenggat waktu ${task.tenggatAngka} hari lagi. Segera kerjakan!`,
                    id: taskIdInt + 100000,
                    // Menjadwalkan notifikasi muncul jam 08:00 pagi setiap hari sampai tugas diselesaikan/berubah
                    schedule: { on: { hour: 8, minute: 0 } },
                    extra: { taskId: task.id }
                });
            }

            // Kondisi 2: Prioritas Sangat Tinggi atau Terlewat
            if (allowPrioritas && (task.labelPrioritas === "Sangat Tinggi" || task.labelPrioritas === "TERLEWAT")) {
                newNotifications.push({
                    title: "Prioritas Sangat Tinggi/Terlewat!",
                    body: `Jangan lupa kerjakan: ${task.nama}`,
                    id: taskIdInt + 200000,
                    schedule: { every: 'day' }, // Muncul tiap hari pada jam saat dijadwalkan
                    extra: { taskId: task.id }
                });
            }
        });

        // Kondisi 3: Ringkasan Mingguan (Setiap hari Sabtu jam 18:00)
        if (allowWeekly) {
            newNotifications.push({
                title: "Ringkasan Mingguan Tersedia",
                body: "Cek produktivitas dan progres kamu minggu ini di halaman Analistik!",
                id: 999999,
                // 7 = Sabtu pada Capacitor v4+
                schedule: { on: { weekday: 7, hour: 18, minute: 0 } }
            });
        }

        // Jadwalkan semua notifikasi baru
        if (newNotifications.length > 0) {
            await LocalNotifications.schedule({ notifications: newNotifications });
            console.log(`Berhasil menjadwalkan ${newNotifications.length} notifikasi dinamis.`);
        }

    } catch (err) {
        console.error("Gagal menjadwalkan notifikasi dinamis:", err);
    }
};
