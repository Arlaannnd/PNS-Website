window.injectSidebar = function (activeTarget) {
    const sidebarHTML = `
        <aside class="sidebar">
            <div class="sidebar-header">
                <img src="Group 31.png" alt="TaskFlow Logo">
                <h2>TaskFlow</h2>
            </div>
            
            <nav class="sidebar-nav">
                <a href="dashboard.html" class="nav-item ${activeTarget === 'dashboard' ? 'active' : ''}">
                    <img src="Group 64.png" alt="Dashboard" class="nav-icon">
                    Dashboard
                </a>
                <a href="semua-kegiatan.html" class="nav-item ${activeTarget === 'all-tasks' ? 'active' : ''}">
                    <div class="semua-kegiatan-icon">
                        <div class="line-1"></div>
                        <div class="line-2"></div>
                        <div class="line-3"></div>
                    </div>
                    Semua Kegiatan
                </a>
                <a href="tambah-kegiatan.html" class="nav-item ${activeTarget === 'add-task' ? 'active' : ''}">
                    <div class="add-task-icon-wrapper">
                        <i class="fa-solid fa-plus"></i>
                    </div>
                    Tambah Kegiatan
                </a>
                <a href="notifikasi.html" class="nav-item ${activeTarget === 'notifications' ? 'active' : ''}">
                    <img src="Group 12.png" alt="Notifikasi" class="nav-icon">
                    Notifikasi
                </a>
                <a href="analistik.html" class="nav-item ${activeTarget === 'analytics' ? 'active' : ''}">
                    <img src="Group 63.png" alt="Analistik Kegiatan" class="nav-icon">
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

// --- DYNAMIC NOTIFICATIONS ENGINE ---
window.showToastAlert = function(title, text, type = 'info', actionUrl = '', actionText = '') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-alert ${type}`;
    
    let iconClass = 'fa-circle-info';
    if (type === 'danger') iconClass = 'fa-circle-xmark';
    else if (type === 'warning') iconClass = 'fa-triangle-exclamation';
    else if (type === 'success') iconClass = 'fa-circle-check';

    let actionButtonHtml = '';
    if (actionUrl && actionText) {
        actionButtonHtml = `
            <div class="toast-actions">
                <a href="${actionUrl}" class="toast-btn primary">${actionText}</a>
                <button class="toast-btn secondary" onclick="this.closest('.toast-alert').classList.remove('show'); setTimeout(() => this.closest('.toast-alert').remove(), 400)">Tutup</button>
            </div>
        `;
    }

    toast.innerHTML = `
        <div class="toast-icon"><i class="fa-solid ${iconClass}"></i></div>
        <div class="toast-body">
            <h4>${title}</h4>
            <p>${text}</p>
            ${actionButtonHtml}
        </div>
        <button class="toast-close" onclick="this.closest('.toast-alert').classList.remove('show'); setTimeout(() => this.closest('.toast-alert').remove(), 400)">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Auto dismiss if no action buttons
    if (!actionButtonHtml) {
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 400);
            }
        }, 5000);
    }
};

window.checkDynamicNotifications = function() {
    const raw = localStorage.getItem('taskData');
    const tasks = raw ? JSON.parse(raw) : [];

    const deadlineEnabled = localStorage.getItem('t-deadline') !== 'false';
    const priorityEnabled = localStorage.getItem('t-prioritas') !== 'false';

    let countOverdue = 0;
    let countUrgent = 0;

    tasks.forEach(task => {
        if (task.status === 'Belum') {
            if (task.tenggatAngka < 0) {
                countOverdue++;
            } else if (task.tenggatAngka <= 2) {
                countUrgent++;
            }
        }
    });

    const totalUrgent = countOverdue + countUrgent;

    // Update badges
    const notifLinks = document.querySelectorAll('a[href="notifikasi.html"]');
    notifLinks.forEach(link => {
        if (link.classList.contains('nav-item')) {
            // Sidebar item
            let existingBadge = link.querySelector('.notif-sidebar-badge');
            if (existingBadge) existingBadge.remove();
            
            if (totalUrgent > 0) {
                const badge = document.createElement('span');
                badge.className = 'notif-sidebar-badge';
                badge.style.cssText = 'background-color: var(--priority-red); color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; margin-left: auto; display: inline-block;';
                badge.textContent = totalUrgent;
                link.appendChild(badge);
            }
        } else {
            // Header bell button
            let existingBadge = link.querySelector('.notif-badge');
            if (existingBadge) existingBadge.remove();

            if (totalUrgent > 0) {
                const badge = document.createElement('span');
                badge.className = 'notif-badge';
                badge.textContent = totalUrgent;
                link.appendChild(badge);
            }
        }
    });

    // Show toast alerts (only once per session)
    if (!sessionStorage.getItem('lastToastShown')) {
        if (countOverdue > 0 && deadlineEnabled) {
            window.showToastAlert(
                '🚨 Kegiatan Terlewat!',
                `Ada ${countOverdue} kegiatan yang sudah melewati tenggat waktu! Segera selesaikan tugas Anda.`,
                'danger',
                'notifikasi.html',
                'Selesaikan Sekarang'
            );
            sessionStorage.setItem('lastToastShown', 'true');
        } else if (countUrgent > 0 && deadlineEnabled) {
            window.showToastAlert(
                '⚠️ Deadline Mendekati!',
                `Kamu memiliki ${countUrgent} kegiatan yang perlu diselesaikan dalam 2 hari ini!`,
                'warning',
                'notifikasi.html',
                'Lihat Notifikasi'
            );
            sessionStorage.setItem('lastToastShown', 'true');
        }
    }
};

// Auto run check on DOMContentLoaded and slightly after
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(window.checkDynamicNotifications, 100);
});

// Also hook into injectSidebar so it runs when sidebar is injected
const originalInjectSidebar = window.injectSidebar;
window.injectSidebar = function(activeTarget) {
    originalInjectSidebar(activeTarget);
    setTimeout(window.checkDynamicNotifications, 50);
};
