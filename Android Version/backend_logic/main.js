import { initApp } from './app.js';
import rawData from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    let taskData = [];
    let statsData = {};

    const views = {
        welcome: document.getElementById('welcome-view'),
        auth: document.getElementById('auth-layout'),
        login: document.getElementById('login-form-view'),
        register: document.getElementById('register-form-view'),
        main: document.getElementById('main-layout')
    };

    function showView(viewElement) {
        views.welcome.classList.remove('active');
        views.auth.style.display = 'none';
        views.main.style.display = 'none';
        views.welcome.style.display = 'none';

        viewElement.style.display = 'flex';
        setTimeout(() => viewElement.classList.add('active'), 10);

        if (viewElement === views.main) {
            renderDashboard();
        }
    }

    function showContentView(contentId) {
        document.querySelectorAll('.content-view').forEach(el => {
            el.style.display = 'none';
            el.classList.remove('active');
        });

        const target = document.getElementById(contentId);
        if (target) {
            target.style.display = 'block';
            setTimeout(() => target.classList.add('active'), 10);
        }

        // Update sidebar
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
            el.classList.remove('active');
            if (el.dataset.target && contentId.startsWith(el.dataset.target)) {
                el.classList.add('active');
            }
        });
    }

    document.getElementById('btn-goto-login').addEventListener('click', () => { showView(views.auth); views.login.style.display = 'block'; views.register.style.display = 'none'; });
    document.getElementById('btn-goto-register').addEventListener('click', () => { showView(views.auth); views.login.style.display = 'none'; views.register.style.display = 'block'; });
    document.getElementById('link-register').addEventListener('click', (e) => { e.preventDefault(); views.login.style.display = 'none'; views.register.style.display = 'block'; });
    document.getElementById('link-login').addEventListener('click', (e) => { e.preventDefault(); views.register.style.display = 'none'; views.login.style.display = 'block'; });

    document.getElementById('login-form').addEventListener('submit', (e) => { e.preventDefault(); showView(views.main); showContentView('dashboard-content'); loadData(); });
    document.getElementById('register-form').addEventListener('submit', (e) => { e.preventDefault(); showView(views.main); showContentView('dashboard-content'); loadData(); });
    document.getElementById('btn-logout').addEventListener('click', (e) => { e.preventDefault(); showView(views.welcome); });

    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.currentTarget.dataset.target;
            if (target === 'dashboard') { showContentView('dashboard-content'); }
            else if (target === 'all-tasks') { showContentView('all-tasks-content'); renderAllTasks(); }
            else if (target === 'add-task') { showContentView('add-task-content'); }
            else if (target === 'notifications') { showContentView('notifications-content'); renderNotifications(); }
            else if (target === 'analytics') { showContentView('analytics-content'); renderAnalytics(); }
            else if (target === 'settings') { showContentView('settings-content'); }
        });
    });

    document.getElementById('fab-add-task').addEventListener('click', () => { showContentView('add-task-content'); });
    document.getElementById('btn-cancel-task').addEventListener('click', () => { showContentView('dashboard-content'); });

    function loadData() {
        const result = initApp();
        taskData = result.dataTersortir;
        statsData = result.hasilStatistik;

        renderDashboard();
    }

    function saveAndReloadData(newDataArray) {
        localStorage.setItem('taskData', JSON.stringify(newDataArray));
        rawData.length = 0;
        newDataArray.forEach(item => rawData.push(item));
        loadData();
    }

    function renderDashboard() {
        document.getElementById('task-count').textContent = taskData.length;
        const tasksList = document.getElementById('upcoming-tasks-list');
        tasksList.innerHTML = '';

        taskData.slice(0, 3).forEach(task => {
            const priorityClass = task.labelPrioritas === 'Sangat Tinggi' ? 'priority-sangat-tinggi' : task.labelPrioritas === 'Tinggi' ? 'priority-tinggi' : 'priority-normal';
            const badgeClass = task.labelPrioritas === 'Sangat Tinggi' ? 'badge-red' : task.labelPrioritas === 'Tinggi' ? 'badge-yellow' : 'badge-green';

            tasksList.innerHTML += `
                <div class="task-card ${priorityClass}">
                    <h4>${task.nama}</h4>
                    <span class="task-cat">${task.kategori}</span>
                    <div class="task-card-footer">
                        <span class="task-time">${task.tenggatHari}</span>
                        <span class="task-badge ${badgeClass}">${task.labelPrioritas}</span>
                    </div>
                </div>
            `;
        });

        if (statsData && statsData.dataPieChart) {
            const total = taskData.length;
            const sangatTinggi = statsData.dataPieChart['Sangat Tinggi'] || 0;
            const tinggi = statsData.dataPieChart['Tinggi'] || 0;
            const normal = (statsData.dataPieChart['Sedang'] || 0) + (statsData.dataPieChart['Rendah'] || 0);

            document.getElementById('total-tasks-stat').textContent = total;

            if (total > 0) {
                document.getElementById('pt-sangat-tinggi').textContent = Math.round((sangatTinggi / total) * 100) + '%';
                document.getElementById('pt-tinggi').textContent = Math.round((tinggi / total) * 100) + '%';
                document.getElementById('pt-normal').textContent = Math.round((normal / total) * 100) + '%';

                const stPct = (sangatTinggi / total) * 100;
                const tPct = stPct + ((tinggi / total) * 100);
                const donut = document.querySelector('.donut-chart');
                if (donut) {
                    donut.style.background = `conic-gradient(var(--priority-red) 0% ${stPct}%, var(--priority-yellow) ${stPct}% ${tPct}%, var(--priority-green) ${tPct}% 100%)`;
                }
            }
        }
    }

    function renderAllTasks(filterText = "") {
        const tbody = document.getElementById('all-tasks-table-body');
        tbody.innerHTML = '';

        let filtered = taskData.filter(t => t.nama.toLowerCase().includes(filterText.toLowerCase()));

        filtered.forEach((task, index) => {
            const badgeClass = task.labelPrioritas === 'Sangat Tinggi' ? 'badge-red' : task.labelPrioritas === 'Tinggi' ? 'badge-yellow' : 'badge-green';
            const actionBtn = task.status === "Selesai" ? `<button class="btn btn-outline" disabled>Selesai</button>` : `<button class="btn btn-primary" onclick="window.selesaikanTugas(${task.id})">Tandai Selesai</button>`;

            tbody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${task.nama}</strong><br><small style="color:var(--text-muted)">${task.jenis}</small></td>
                    <td>${task.kategori}</td>
                    <td>${task.tenggatHari}</td>
                    <td><span class="task-badge ${badgeClass}">${task.labelPrioritas}</span></td>
                    <td>${task.status}</td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        });
    }

    document.getElementById('search-tasks').addEventListener('input', (e) => {
        renderAllTasks(e.target.value);
    });

    window.selesaikanTugas = function (taskId) {
        const currentData = JSON.parse(localStorage.getItem('taskData') || '[]');
        const taskIndex = currentData.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            currentData[taskIndex].status = "Selesai";
            currentData[taskIndex].hariSelesai = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
            saveAndReloadData(currentData);
            renderAllTasks(document.getElementById('search-tasks').value);
            alert("Tugas ditandai selesai!");
        }
    };

    document.getElementById('add-task-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const nama = document.getElementById('task-name').value;
        const kategori = document.getElementById('task-category').value;
        const prioritasInput = document.getElementById('task-priority').value;
        const dateInput = document.getElementById('task-date').value;

        let tenggatAngka = 7;
        if (dateInput) {
            const targetDate = new Date(dateInput);
            const today = new Date();
            const diffTime = targetDate - today;
            tenggatAngka = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        const newTask = {
            id: Date.now(),
            nama: nama,
            jenis: "Individu",
            kategori: kategori || "Tugas",
            tenggatAngka: tenggatAngka,
            bebanSKS: 2,
            tingkatKesulitan: prioritasInput === "Sangat Tinggi" ? 5 : 3,
            riwayatTerlambat: "Tidak Pernah",
            hariSelesai: null,
            status: "Belum"
        };

        const currentData = JSON.parse(localStorage.getItem('taskData') || '[]');
        currentData.push(newTask);

        saveAndReloadData(currentData);
        e.target.reset();
        alert('Kegiatan berhasil ditambahkan dan disimpan!');
        showContentView('dashboard-content');
    });

    function renderNotifications() {
        const list = document.getElementById('notifications-list');
        list.innerHTML = '';

        const sortedByUrgency = [...taskData].sort((a, b) => a.tenggatAngka - b.tenggatAngka);
        let count = 0;

        sortedByUrgency.forEach(task => {
            if (task.status === "Belum" && count < 5) {
                let alertClass = "alert-green";
                let iconClass = "fa-check";
                let msg = `Kegiatan ${task.nama} dijadwalkan pada ${task.tenggatHari}.`;

                if (task.labelPrioritas === "Sangat Tinggi" || task.tenggatAngka <= 2) {
                    alertClass = "alert-red";
                    iconClass = "fa-triangle-exclamation";
                    msg = `SEGERA KERJAKAN! ${task.nama} tenggat waktu ${task.tenggatHari} lagi.`;
                } else if (task.labelPrioritas === "Tinggi" || task.tenggatAngka <= 5) {
                    alertClass = "alert-yellow";
                    iconClass = "fa-clock";
                    msg = `Perhatian, ${task.nama} perlu diselesaikan dalam ${task.tenggatHari}.`;
                }

                list.innerHTML += `
                    <div class="notification-item ${alertClass}">
                        <div class="notif-icon"><i class="fa-solid ${iconClass}"></i></div>
                        <div class="notif-content">
                            <h4>${task.nama}</h4>
                            <p>${msg}</p>
                            <span class="notif-time">Prioritas: ${task.labelPrioritas}</span>
                        </div>
                    </div>
                `;
                count++;
            }
        });

        if (count === 0) {
            list.innerHTML = '<p style="color:var(--text-muted)">Tidak ada notifikasi saat ini.</p>';
        }
    }

    function renderAnalytics() {
        if (!statsData) return;

        document.getElementById('stat-total').textContent = statsData.totalKegiatan;
        document.getElementById('stat-mean').textContent = statsData.rataRata;
        document.getElementById('stat-prob').textContent = statsData.probabilitasKeterlambatan;
        document.getElementById('stat-prod').textContent = statsData.produktivitasMingguan;
        document.getElementById('stat-modus').textContent = statsData.modus;
        document.getElementById('stat-median').textContent = statsData.median;

        const chartContainer = document.getElementById('bar-chart-container');
        chartContainer.innerHTML = '';

        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const maxVal = Math.max(...Object.values(statsData.dataBarChart || {}));

        days.forEach(day => {
            const val = statsData.dataBarChart[day] || 0;
            const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0;

            chartContainer.innerHTML += `
                <div class="bar-wrapper">
                    <div class="bar" style="height: ${heightPct}%" title="${val} tasks"></div>
                    <span class="bar-label">${day}</span>
                </div>
            `;
        });
    }

    // Init
    showView(views.welcome);
});
