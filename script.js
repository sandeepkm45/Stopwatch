class SimpleStopwatch {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.lapData = [];
        this.interval = null;
        this.lastLapTime = 0;

        this.initElements();
        this.bindEvents();
        this.updateDisplay();
    }

    initElements() {
        this.timeDisplay = document.getElementById('timeDisplay');
        this.millisecondsDisplay = document.getElementById('millisecondsDisplay');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.lapBtn = document.getElementById('lapBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.lapDataEl = document.getElementById('lapData');
        this.statsEl = document.getElementById('stats');
        this.totalLapsEl = document.getElementById('totalLaps');
        this.bestLapEl = document.getElementById('bestLap');
        this.avgLapEl = document.getElementById('avgLap');
        this.totalTimeEl = document.getElementById('totalTime');
        this.stopwatchIcon = document.getElementById('stopwatchIcon');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.lapBtn.addEventListener('click', () => this.recordLap());
        this.resetBtn.addEventListener('click', () => this.reset());
    }

    start() {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.interval = setInterval(() => this.updateDisplay(), 10);
            this.isRunning = true;

            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.lapBtn.disabled = false;

            this.timeDisplay.classList.add('running');
            this.stopwatchIcon.classList.add('running');
        }
    }

    stop() {
        if (this.isRunning) {
            clearInterval(this.interval);
            this.isRunning = false;

            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
            this.lapBtn.disabled = true;

            this.timeDisplay.classList.remove('running');
            this.stopwatchIcon.classList.remove('running');
        }
    }

    reset() {
        clearInterval(this.interval);
        this.startTime = 0;
        this.elapsedTime = 0;
        this.lastLapTime = 0;
        this.isRunning = false;
        this.lapData = [];

        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.lapBtn.disabled = true;

        this.timeDisplay.classList.remove('running');
        this.updateDisplay();
        this.updateLapDisplay();
        this.updateStats();
    }

    recordLap() {
        if (this.isRunning) {
            const currentElapsed = this.elapsedTime;
            const lapTime = currentElapsed - this.lastLapTime;

            const lapEntry = {
                lapNumber: this.lapData.length + 1,
                lapTime: lapTime,
                totalTime: currentElapsed,
                timestamp: new Date().toLocaleString()
            };

            this.lapData.push(lapEntry);
            this.lastLapTime = currentElapsed;

            this.updateLapDisplay();
            this.updateStats();
        }
    }

    updateDisplay() {
        if (this.isRunning) {
            this.elapsedTime = Date.now() - this.startTime;
        }

        const formatted = this.formatTime(this.elapsedTime);
        this.timeDisplay.textContent = formatted.time;
        this.millisecondsDisplay.textContent = formatted.ms;
    }

    updateLapDisplay() {
        if (this.lapData.length === 0) {
            this.lapDataEl.innerHTML = '<div class="no-data">No lap data recorded</div>';
            return;
        }

        let html = '';
        this.lapData.slice().reverse().forEach((lap, index) => {
            const lapTime = this.formatTime(lap.lapTime);
            const totalTime = this.formatTime(lap.totalTime);

            html += `
                <div class="lap-item ${index === 0 ? 'new' : ''}">
                    <div class="lap-number">Lap ${lap.lapNumber}</div>
                    <div class="lap-time">${lapTime.time}.${lapTime.ms}</div>
                    <div class="lap-total">${totalTime.time}</div>
                </div>
            `;
        });

        this.lapDataEl.innerHTML = html;
    }

    updateStats() {
        if (this.lapData.length === 0) {
            this.statsEl.style.display = 'none';
            return;
        }

        this.statsEl.style.display = 'grid';

        const lapTimes = this.lapData.map(lap => lap.lapTime);
        const bestLap = Math.min(...lapTimes);
        const avgLap = lapTimes.reduce((a, b) => a + b, 0) / lapTimes.length;
        const totalTime = this.elapsedTime;

        this.totalLapsEl.textContent = this.lapData.length;
        this.bestLapEl.textContent = this.formatTime(bestLap).time;
        this.avgLapEl.textContent = this.formatTime(avgLap).time;
        this.totalTimeEl.textContent = this.formatTime(totalTime).time;
    }

    formatTime(ms) {
        const totalMs = Math.abs(ms);
        const hours = Math.floor(totalMs / 3600000);
        const minutes = Math.floor((totalMs % 3600000) / 60000);
        const seconds = Math.floor((totalMs % 60000) / 1000);
        const centiseconds = Math.floor((totalMs % 1000) / 10);

        return {
            time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`,
            ms: centiseconds.toString().padStart(2, '0')
        };
    }

    exportData() {
        if (this.lapData.length === 0) {
            alert('No data to export!');
            return;
        }

        const data = this.prepareExportData();
        this.downloadAsFile(data, 'stopwatch-data.txt');
    }

    prepareExportData() {
        let data = 'STOPWATCH LAP DATA\n';
        data += '==================\n\n';
        data += `Export Date: ${new Date().toLocaleString()}\n`;
        data += `Total Laps: ${this.lapData.length}\n\n`;

        data += 'LAP DETAILS:\n';
        data += '-----------\n';
        this.lapData.forEach(lap => {
            const lapTime = this.formatTime(lap.lapTime);
            const totalTime = this.formatTime(lap.totalTime);
            data += `Lap ${lap.lapNumber}: ${lapTime.time}.${lapTime.ms} (Total: ${totalTime.time})\n`;
        });

        if (this.lapData.length > 0) {
            const lapTimes = this.lapData.map(lap => lap.lapTime);
            const bestLap = Math.min(...lapTimes);
            const avgLap = lapTimes.reduce((a, b) => a + b, 0) / lapTimes.length;

            data += '\nSTATISTICS:\n';
            data += '-----------\n';
            data += `Best Lap: ${this.formatTime(bestLap).time}\n`;
            data += `Average Lap: ${this.formatTime(avgLap).time}\n`;
            data += `Total Time: ${this.formatTime(this.elapsedTime).time}\n`;
        }

        return data;
    }

    downloadAsFile(data, filename) {
        const blob = new Blob([data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Global export function
let stopwatch;

function exportData() {
    stopwatch.exportData();
}

// Initialize stopwatch when page loads
document.addEventListener('DOMContentLoaded', () => {
    stopwatch = new SimpleStopwatch();
});