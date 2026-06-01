import './database/supabaseclient.js';

window.injectSidebar('analytics');
window.updateUserInfo();

async function initializeAnalistik() {
    await window.loadTaskDataFromSupabase();
    const result = window.initApp();
    const statsData = result.hasilStatistik;
    const taskData = result.dataTersortir;

    if (statsData && taskData) {
        const tasksSelesai = statsData.tugasSelesai || taskData.filter(t => t.status === "Selesai").length;
        document.getElementById('stat-total-text').textContent = `${tasksSelesai} dari ${taskData.length} tugas.`;

        const progressPct = taskData.length ? Math.round((tasksSelesai / taskData.length) * 100) : 0;
        document.getElementById('stat-progress-text').innerHTML = `Kamu menyelesaikan ${tasksSelesai}<br>kegiatan dari ${taskData.length}.`;
        document.getElementById('circle-progress-path').setAttribute('stroke-dasharray', `${progressPct}, 100`);
        document.getElementById('circle-progress-text').textContent = `${progressPct}%`;

        const total = taskData.length;
        const terlewat = statsData.dataPieChart['TERLEWAT'] || 0;
        const sangatTinggi = statsData.dataPieChart['Sangat Tinggi'] || 0;
        const tinggi = statsData.dataPieChart['Tinggi'] || 0;
        const sedang = statsData.dataPieChart['Sedang'] || 0;
        const normal = statsData.dataPieChart['Rendah'] || 0;

        document.getElementById('total-tasks-stat').textContent = total;
        if (total > 0) {
            document.getElementById('pt-terlewat').textContent = Math.round((terlewat / total) * 100) + '%';
            document.getElementById('pt-sangat-tinggi').textContent = Math.round((sangatTinggi / total) * 100) + '%';
            document.getElementById('pt-tinggi').textContent = Math.round((tinggi / total) * 100) + '%';
            document.getElementById('pt-sedang').textContent = Math.round((sedang / total) * 100) + '%';
            document.getElementById('pt-normal').textContent = Math.round((normal / total) * 100) + '%';

            const terwPct = (terlewat / total) * 100;
            const stPct = terwPct + ((sangatTinggi / total) * 100);
            const tPct = stPct + ((tinggi / total) * 100);
            const sPct = tPct + ((sedang / total) * 100);

            const donut = document.getElementById('donut-chart');
            if (donut) {
                donut.style.background = `conic-gradient(var(--priority-terlewat) 0% ${terwPct}%, var(--priority-red) ${terwPct}% ${stPct}%, var(--priority-yellow) ${stPct}% ${tPct}%, var(--priority-orange) ${tPct}% ${sPct}%, var(--priority-green) ${sPct}% 100%)`;
            }
        }

        const prodPct = statsData.produktivitasAngka || 0;
        document.getElementById('stat-prod').textContent = statsData.produktivitasMingguan;

        if (prodPct >= 50) {
            document.getElementById('prod-title').className = 'text-green';
            document.getElementById('prod-comparison').textContent = `${tasksSelesai} dari ${taskData.length} tugas selesai`;
        } else {
            document.getElementById('prod-title').className = 'text-red';
            document.getElementById('prod-comparison').textContent = `${tasksSelesai} dari ${taskData.length} tugas selesai`;
        }

        const lateCount = statsData.tugasTerlambatAbsolut;
        document.getElementById('stat-late').textContent = lateCount;

        if (lateCount > 0) {
            document.getElementById('late-comparison').textContent = `${lateCount} tugas sudah melewati deadline`;
        } else {
            document.getElementById('late-comparison').textContent = 'Semua tugas masih dalam tenggat waktu';
        }

        const avgTime = statsData.rataRataWaktu || '0.0';
        document.getElementById('stat-mean-time').innerHTML = `${avgTime} <span style="font-size: 16px; font-weight: 500; color: #6b7280; margin-left: 4px;">jam</span>`;

        let diff = 0.6;
        document.getElementById('mean-comparison').textContent = `-${diff} jam dari minggu lalu`;
        const chartContainer = document.getElementById('bar-chart-container');
        const yaxisContainer = document.getElementById('bar-yaxis');
        chartContainer.innerHTML = '';
        yaxisContainer.innerHTML = '';

        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const totalPerDay = { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0 };
        const completedPerDay = { ...statsData.dataBarChart };
        const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        taskData.forEach(t => {
            if (t.status === "Selesai" && t.hariSelesai) {
                totalPerDay[t.hariSelesai] = (totalPerDay[t.hariSelesai] || 0) + 1;
            } else {
                // Distribute pending tasks based on their deadline day
                const now = new Date();
                const deadlineDate = new Date(now);
                deadlineDate.setDate(now.getDate() + (t.tenggatAngka || 0));
                const dName = dayOfWeek[deadlineDate.getDay()];
                if (totalPerDay[dName] !== undefined) {
                    totalPerDay[dName] = (totalPerDay[dName] || 0) + 1;
                }
            }
        });

        days.forEach(d => {
            const completed = completedPerDay[d] || 0;
            if (totalPerDay[d] < completed) {
                totalPerDay[d] = completed;
            }
        });

        const allValues = days.map(d => Math.max(totalPerDay[d] || 0, completedPerDay[d] || 0));
        const maxVal = Math.max(...allValues, 1);
        const yMax = Math.ceil(maxVal / 5) * 5 || 5;
        const ySteps = [0, Math.round(yMax * 0.25), Math.round(yMax * 0.5), Math.round(yMax * 0.75), yMax];

        ySteps.forEach(v => {
            yaxisContainer.innerHTML += `<span>${v}</span>`;
        });
        let maxDay = "";
        let highest = -1;
        days.forEach(d => {
            if ((completedPerDay[d] || 0) > highest) {
                highest = completedPerDay[d] || 0;
                maxDay = d;
            }
        });

        days.forEach(day => {
            const total = totalPerDay[day] || 0;
            const completed = completedPerDay[day] || 0;
            const bgHeightPct = yMax > 0 ? (total / yMax) * 100 : 0;
            const fgHeightPct = total > 0 ? (completed / total) * 100 : 0;
            const isHighlight = (day === maxDay && highest > 0);
            const isEmpty = total === 0 && completed === 0;

            chartContainer.innerHTML += `
            <div class="bar-wrapper ${isEmpty ? 'bar-empty' : ''}">
                <div class="bar-bg ${isHighlight ? 'highlight-bg' : ''}" style="height: ${Math.max(bgHeightPct, 6)}%">
                    <div class="bar-fg ${isHighlight ? 'highlight' : ''}" style="height: ${fgHeightPct}%"></div>
                </div>
                <span class="bar-label">${day}</span>
            </div>
        `;
        });
    }
}

initializeAnalistik();
