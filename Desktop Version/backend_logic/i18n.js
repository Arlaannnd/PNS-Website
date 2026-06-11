const kamusBahasa = {
    'id': {
        'menu_settings': 'Pengaturan',
        'set_edit_profil': 'Edit Profil',
        'set_tot_kegiatan': 'Total Kegiatan',
        'set_selesai': 'Selesai',
        'set_terlambat': 'Terlambat',
        'set_keamanan': 'Kata Sandi & Keamanan',
        'set_notif': 'Notifikasi',
        'set_bahasa': 'Bahasa',
        'set_simpan_bahasa': 'Simpan Bahasa',
        'set_faq': 'Bantuan (FAQ)'
    },
    'en': {
        'menu_settings': 'Settings',
        'set_edit_profil': 'Edit Profile',
        'set_tot_kegiatan': 'Total Tasks',
        'set_selesai': 'Completed',
        'set_terlambat': 'Overdue',
        'set_keamanan': 'Password & Security',
        'set_notif': 'Notifications',
        'set_bahasa': 'Language',
        'set_simpan_bahasa': 'Save Language',
        'set_faq': 'Help & FAQ'
    },
    'jw': {
        'menu_settings': 'Pengaturan',
        'set_edit_profil': 'Ganti Profil',
        'set_tot_kegiatan': 'Gunggunge Tugas',
        'set_selesai': 'Rampung',
        'set_terlambat': 'Telat',
        'set_keamanan': 'Sandi & Keamanan',
        'set_notif': 'Peling',
        'set_bahasa': 'Basa',
        'set_simpan_bahasa': 'Simpen Basa',
        'set_faq': 'Pitakonan'
    }
};

window.terjemahkanHalaman = function () {
    const bahasaAktif = localStorage.getItem('appLanguage') || 'id';
    const kamusAktif = kamusBahasa[bahasaAktif];

    if (!kamusAktif) return;
    document.querySelectorAll('[data-i18n]').forEach(elemen => {
        const kunci = elemen.getAttribute('data-i18n');

        if (kamusAktif[kunci]) {
            elemen.textContent = kamusAktif[kunci];
        }
    });
};

document.addEventListener('DOMContentLoaded', window.terjemahkanHalaman);