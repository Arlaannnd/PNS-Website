window.injectSidebar = function (activeTarget) {
    const sidebarHTML = `
        <aside class="sidebar">
            <div class="sidebar-header">
                <i class="fa-solid fa-circle-check"></i>
                <h2>TaskFlow</h2>
            </div>
            
            <nav class="sidebar-nav">
                <a href="dashboard.html" class="nav-item ${activeTarget === 'dashboard' ? 'active' : ''}">
                    <i class="fa-solid fa-table-cells-large"></i>
                    Dashboard
                </a>
                <a href="semua-kegiatan.html" class="nav-item ${activeTarget === 'all-tasks' ? 'active' : ''}">
                    <i class="fa-solid fa-list-ul"></i>
                    Semua Kegiatan
                </a>
                <a href="tambah-kegiatan.html" class="nav-item ${activeTarget === 'add-task' ? 'active' : ''}">
                    <i class="fa-solid fa-plus-circle"></i>
                    Tambah Kegiatan
                </a>
                <a href="notifikasi.html" class="nav-item ${activeTarget === 'notifications' ? 'active' : ''}">
                    <i class="fa-regular fa-bell"></i>
                    Notifikasi
                </a>
                <a href="analistik.html" class="nav-item ${activeTarget === 'analytics' ? 'active' : ''}">
                    <i class="fa-solid fa-chart-simple"></i>
                    Analistik Kegiatan
                </a>
            </nav>
            
            <div class="sidebar-footer">
                <hr>
                <a href="pengaturan.html" class="nav-item ${activeTarget === 'settings' ? 'active' : ''}">
                    <i class="fa-solid fa-gear"></i>
                    Settings
                </a>
                <a href="index.html" class="nav-item" id="btn-logout">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i>
                    Logout
                </a>
            </div>
        </aside>
    `;

    const container = document.getElementById('sidebar-container');
    if (container) {
        container.outerHTML = sidebarHTML;
    }
}

window.updateUserInfo = function () {
    const storedName = localStorage.getItem('userName') || 'Subekti Rahman';
    const storedNickname = localStorage.getItem('userNickname') || 'Subekti';
    const storedEmail = localStorage.getItem('userEmail') || 'subekti@contoh.com';
    const storedGender = localStorage.getItem('userGender') || 'Laki-laki';
    const storedTimezone = localStorage.getItem('userTimezone') || 'WIB';

    const greetingEl = document.getElementById('user-greeting');
    if (greetingEl) {
        greetingEl.textContent = 'Hai, ' + storedNickname;
    }

    const profileNameEl = document.getElementById('profile-name-input');
    if (profileNameEl) {
        profileNameEl.value = storedName;
    }

    const profileNicknameEl = document.getElementById('profile-nickname-input');
    if (profileNicknameEl) {
        profileNicknameEl.value = storedNickname;
    }

    const profileEmailEl = document.getElementById('profile-email-input');
    if (profileEmailEl) {
        profileEmailEl.value = storedEmail;
    }

    const profileGenderEl = document.getElementById('profile-gender-input');
    if (profileGenderEl) {
        profileGenderEl.value = storedGender;
    }

    const profileTimezoneEl = document.getElementById('profile-timezone-input');
    if (profileTimezoneEl) {
        profileTimezoneEl.value = storedTimezone;
    }
}
