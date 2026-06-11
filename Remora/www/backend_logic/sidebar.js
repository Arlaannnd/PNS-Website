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

window.updateUserInfo = async function () {
    const { session } = await window.authService.getSession();
    if (!session) return;

    const { data: profile } = await window.authService.getProfile();

    const email = session.user.email;
    const defaultName = email.split('@')[0];

    const storedName = profile?.namalengkap || defaultName;
    const storedNickname = profile?.nickname || defaultName;
    const storedEmail = profile?.email || email;
    const storedGender = profile?.gender || 'Laki-laki';
    const storedTimezone = profile?.timezone || 'WIB';

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

window.showToastAlert = function (title, text, type = 'info', actionUrl = '', actionText = '') {
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

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    if (!actionButtonHtml) {
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 400);
            }
        }, 5000);
    }
};

window.activeTimerInterval = null;
window.checkActiveTimer = function () {
    if (!window.taskData) return;

    let activeTask = window.taskData.find(t => t.waktuMulai && t.status !== 'Selesai');

    // Fallback if database hasn't synced yet
    const fallbackId = sessionStorage.getItem('activeTimerTaskId');
    if (!activeTask && fallbackId) {
        activeTask = window.taskData.find(t => t.id == fallbackId && t.status !== 'Selesai');
        if (activeTask && !activeTask.waktuMulai) {
            activeTask.waktuMulai = new Date().toISOString();
        }
    }

    if (activeTask) {
        let timerContainer = document.getElementById('active-timer-banner');
        if (!timerContainer) {
            timerContainer = document.createElement('div');
            timerContainer.id = 'active-timer-banner';
            timerContainer.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: #1e293b;
                color: white;
                padding: 10px 16px;
                border-radius: 50px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 12px;
                font-family: 'Inter', sans-serif;
                font-weight: 600;
                width: 90%;
                max-width: 350px;
                transition: all 0.3s ease;
                justify-content: space-between;
            `;
            document.body.appendChild(timerContainer);
        }

        const startTime = new Date(activeTask.waktuMulai).getTime();

        function updateTimer() {
            const now = new Date().getTime();
            const diff = Math.floor((now - startTime) / 1000);

            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;

            const timeStr = [
                hours.toString().padStart(2, '0'),
                minutes.toString().padStart(2, '0'),
                seconds.toString().padStart(2, '0')
            ].join(':');

            timerContainer.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                    <i class="fa-solid fa-stopwatch fa-spin" style="font-size:16px;"></i>
                    <div style="display:flex; flex-direction:column; min-width:0;">
                        <span style="font-size:9px; opacity:0.8; line-height:1; margin-bottom:2px;">Mengerjakan</span>
                        <span style="font-size:12px; line-height:1.2; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 100%;">${activeTask.nama}</span>
                    </div>
                </div>
                <div style="font-size:16px; font-variant-numeric: tabular-nums; letter-spacing: 1px;">${timeStr}</div>
                <div style="display:flex; gap: 6px;">
                    <button onclick="window.batalkanTimer(${activeTask.id})" title="Hentikan Timer" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 6px 10px; border-radius: 20px; cursor: pointer;"><i class="fa-solid fa-pause"></i></button>
                    <button onclick="window.selesaikanKegiatanTimer(${activeTask.id})" style="background: white; color: #1e293b; border: none; padding: 6px 12px; border-radius: 20px; font-weight: 700; cursor: pointer; font-size:11px;">Selesai</button>
                </div>
            `;
        }

        updateTimer();
        if (window.activeTimerInterval) clearInterval(window.activeTimerInterval);
        window.activeTimerInterval = setInterval(updateTimer, 1000);
    } else {
        const timerContainer = document.getElementById('active-timer-banner');
        if (timerContainer) timerContainer.remove();
        if (window.activeTimerInterval) clearInterval(window.activeTimerInterval);
    }
};

window.checkDynamicNotifications = async function () {
    if ((!window.taskData || window.taskData.length === 0) && window.loadTaskData) {
        await window.loadTaskData();
    }
    const tasks = window.taskData || [];

    const { data: profile } = await window.authService.getProfile();
    const deadlineEnabled = profile?.t_deadline !== false;
    const priorityEnabled = profile?.t_prioritas !== false;

    let countOverdue = 0;
    let countUrgent = 0;
    let currentUrgentIds = [];

    tasks.forEach(task => {
        if (task.status === 'Belum') {
            if (task.tenggatAngka < 0) {
                countOverdue++;
                currentUrgentIds.push(task.id);
            } else if (task.tenggatAngka <= 2) {
                countUrgent++;
                currentUrgentIds.push(task.id);
            }
        }
    });

    const totalUrgent = countOverdue + countUrgent;
    
    let lastSeenUrgentTasks = [];
    try {
        lastSeenUrgentTasks = JSON.parse(localStorage.getItem('lastSeenUrgentTasks') || '[]');
    } catch(e) {}

    let shouldShowBadge = false;
    if (window.location.pathname.includes('notifikasi.html')) {
        localStorage.setItem('lastSeenUrgentTasks', JSON.stringify(currentUrgentIds));
        shouldShowBadge = false;
    } else {
        shouldShowBadge = currentUrgentIds.some(id => !lastSeenUrgentTasks.includes(id));
    }

    const notifLinks = document.querySelectorAll('a[href="notifikasi.html"]');
    notifLinks.forEach(link => {
        link.addEventListener('click', function() {
            const badge = this.querySelector('.notif-sidebar-badge, .notif-badge, .notification-dot');
            if (badge) badge.style.display = 'none';
        });

        if (link.classList.contains('nav-item')) {
            let existingBadge = link.querySelector('.notif-sidebar-badge');
            if (existingBadge) existingBadge.remove();

            if (shouldShowBadge && totalUrgent > 0) {
                const badge = document.createElement('span');
                badge.className = 'notif-sidebar-badge';
                badge.style.cssText = 'background-color: #EF4444; width: 12px; height: 12px; border-radius: 50%; margin-left: auto; display: inline-block;';
                link.appendChild(badge);
            }
        } else {
            let existingBadge = link.querySelector('.notif-badge');
            if (existingBadge) existingBadge.remove();

            let staticDot = link.querySelector('span[style*="width:10px"]');
            if (staticDot) staticDot.remove();

            let staticDot2 = link.querySelector('span[style*="background-color:white"]');
            if (staticDot2) staticDot2.remove();

            let topbarDot = link.querySelector('.notification-dot');
            if (topbarDot) topbarDot.remove();

            if (shouldShowBadge && totalUrgent > 0) {
                const badge = document.createElement('span');
                badge.className = 'notif-badge notification-dot';
                badge.style.cssText = 'position: absolute; top: 6px; right: 8px; width: 12px; height: 12px; background-color: #EF4444; border-radius: 50%;';
                link.appendChild(badge);
            }
        }
    });

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

    // Call checkActiveTimer now that taskData is loaded
    if (window.checkActiveTimer) {
        window.checkActiveTimer();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(window.checkDynamicNotifications, 100);
    setTimeout(window.checkActiveTimer, 100);
    setTimeout(window.updateUserInfo, 150);
});

const originalInjectSidebar = window.injectSidebar;
window.injectSidebar = function (activeTarget) {
    originalInjectSidebar(activeTarget);
    setTimeout(window.checkDynamicNotifications, 50);
    setTimeout(window.checkActiveTimer, 50);
    setTimeout(window.updateUserInfo, 100);

    setTimeout(() => {
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn && !logoutBtn.hasAttribute('data-logout-bound')) {
            logoutBtn.setAttribute('data-logout-bound', 'true');
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (window.showCustomModal) {
                    const confirmRes = await window.showCustomModal({
                        title: "Keluar Akun",
                        message: "Apakah Anda yakin ingin keluar dari akun ini?",
                        type: "confirm",
                        confirmText: "Ya, Keluar"
                    });
                    if (!confirmRes) return;
                } else {
                    if (!confirm("Apakah Anda yakin ingin keluar dari akun ini?")) return;
                }
                if (window.authService) {
                    await window.authService.signOut();
                }
                window.location.href = 'index.html';
            });
        }
    }, 150);
};
