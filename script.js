const minutesElement =
    document.querySelector(".minutes");

const secondsElement =
    document.querySelector(".seconds");

const millisecondsElement =
    document.querySelector(".milliseconds");

const startButton =
    document.querySelector("#startButton");

const resetButton =
    document.querySelector("#resetButton");

const lapButton =
    document.querySelector("#lapButton");

const lapList =
    document.querySelector("#lapList");

const lapCount =
    document.querySelector("#lapCount");

const bestLapElement =
    document.querySelector("#bestLap");

const averageLapElement =
    document.querySelector("#averageLap");

const slowestLapElement =
    document.querySelector("#slowestLap");

const statusText =
    document.querySelector(".status-text");

const resetModal =
    document.querySelector("#resetModal");

const cancelResetButton =
    document.querySelector("#cancelReset");

const confirmResetButton =
    document.querySelector("#confirmReset");

const totalTimeElement =
    document.querySelector("#totalTime");

const totalLapsElement =
    document.querySelector("#totalLaps");

const trendChart =
    document.querySelector("#trendChart");

const trendStatus =
    document.querySelector("#trendStatus");

const historyList =
    document.querySelector("#historyList");

const clearHistoryButton =
    document.querySelector("#clearHistoryButton");

const historyModal = 
    document.querySelector("#historyModal");

const cancelHistoryAction = 
    document.querySelector("#cancelHistoryAction");

const confirmHistoryAction = 
    document.querySelector("#confirmHistoryAction");

const historyModalTitle = 
    document.querySelector("#historyModalTitle");

const historyModalMessage = 
    document.querySelector("#historyModalMessage");

const HISTORY_STORAGE_KEY = "proStopWatchHistory";

let sessionHistory = [];

try {
    const savedHistory = JSON.parse(
        localStorage.getItem(HISTORY_STORAGE_KEY) || "[]"
    );
    sessionHistory = Array.isArray(savedHistory)
        ? savedHistory
        : [];
} catch (error) {
    console.error("Unable to load session history:", error);
}

let historyAction = null;
let historyActionId = null;

class Stopwatch {

    constructor() {

        this.elapsedTime = 0;

        this.startTime = null;

        this.previousLapTime = 0;

        this.interval = null;

        this.isRunning = false;

        this.laps = [];

    }

    start() {

        if (this.isRunning) {
            return;
        }

        this.isRunning = true;

        this.startTime =
            Date.now() - this.elapsedTime;

        this.interval =
            setInterval(() => {

                this.update();

            }, 10);

        this.updateUI();

    }

    stop() {

        if (!this.isRunning) {
            return;
        }
        this.update();

        this.isRunning = false;

        clearInterval(this.interval);

        this.interval = null;

        this.updateUI();

    }

    update() {

        if (!this.isRunning) {
            return;
        }

        this.elapsedTime =
            Date.now() - this.startTime;

        updateTimerDisplay(
            this.elapsedTime
        );

        updatePerformance();

    }

    reset() {
        this.stop();

        this.elapsedTime = 0;
        this.startTime = null;
        this.previousLapTime = 0;
        this.laps = [];

        updateTimerDisplay(0);
        renderLaps();
        updateStatistics();
        updatePerformance();
        this.updateUI();
    }
    
    addLap() {

        if (!this.isRunning) {
            return;
        }

        this.update();

        const currentTime = this.elapsedTime;

        const lapDuration =
            currentTime - this.previousLapTime;

        this.previousLapTime = currentTime;

        const lap = {

            number: this.laps.length + 1,

            duration: lapDuration,

            total: currentTime

        };

        this.laps.unshift(lap);

        renderLaps();

        updateStatistics();

        updatePerformance();

        renderTrendChart();

        showLapFeedback();

    }

    updateUI() {

        if (this.isRunning) {

            document.querySelector("#status").className = "status running";

            document.body.classList.add(
                "running"
            );

            statusText.textContent =
                "RUNNING";

            startButton.classList.remove(
                "start"
            );

            startButton.classList.add(
                "stop"
            );

            startButton.innerHTML = `
                <i class="fa-solid fa-pause"></i>
                <span>Stop</span>
            `;

            startButton.setAttribute(
                "aria-label",
                "Stop stopwatch"
            );

            lapButton.disabled = false;

        }

        else {
            
            document.querySelector("#status").className =
                this.elapsedTime > 0 ? "status paused" : "status ready";

            document.body.classList.remove(
                "running"
            );

            statusText.textContent =
                this.elapsedTime > 0
                    ? "PAUSED"
                    : "READY";

            startButton.classList.remove(
                "stop"
            );

            startButton.classList.add(
                "start"
            );

            startButton.innerHTML = `
                <i class="fa-solid fa-play"></i>
                <span>Start</span>
            `;

            startButton.setAttribute(
                "aria-label",
                "Start stopwatch"
            );

            lapButton.disabled = true;

        }

    }

}

const stopwatch = new Stopwatch();

function formatTime(milliseconds) {

    const minutes =
        Math.floor(
            milliseconds / 60000
        );

    const seconds =
        Math.floor(
            (milliseconds % 60000) / 1000
        );

    const ms =
        milliseconds % 1000;

    return {

        minutes:
            String(minutes)
                .padStart(2, "0"),

        seconds:
            String(seconds)
                .padStart(2, "0"),

        milliseconds:
            String(ms)
                .padStart(3, "0")

    };

}

function updateTimerDisplay(milliseconds) {

    const time =
        formatTime(milliseconds);

    minutesElement.textContent =
        time.minutes;

    secondsElement.textContent =
        time.seconds;

    millisecondsElement.textContent =
        time.milliseconds;

}

function formatLapTime(milliseconds) {

    const seconds =
        Math.floor(
            milliseconds / 1000
        );

    const ms =
        milliseconds % 1000;

    return (
        String(seconds).padStart(2, "0")
        +
        ":"
        +
        String(ms).padStart(3, "0")
    );

}

function formatTotalTime(milliseconds) {

    const minutes =
        Math.floor(
            milliseconds / 60000
        );


    const seconds =
        Math.floor(
            (milliseconds % 60000) / 1000
        );


    const ms =
        milliseconds % 1000;


    return (
        String(minutes).padStart(2, "0")
        +
        ":"
        +
        String(seconds).padStart(2, "0")
        +
        ":"
        +
        String(ms).padStart(3, "0")
    );

}

function renderLaps() {

    lapList.innerHTML = "";

    if (stopwatch.laps.length === 0) {

        lapList.innerHTML = `

            <li class="empty-state">

                <div class="empty-icon">
                    <i class="fa-solid fa-flag-checkered"></i>
                </div>

                <h3>No laps recorded</h3>

                <p>
                    Start the stopwatch and press
                    <strong>Lap</strong>
                    to record your time.
                </p>

            </li>

        `;

        lapCount.textContent = "0 Laps";

        return;
    }

    const lapTimes =
        stopwatch.laps.map(
            lap => lap.duration
        );

    const bestLap =
        Math.min(...lapTimes);

    const slowestLap =
        Math.max(...lapTimes);

    stopwatch.laps.forEach((lap) => {

        const li =
            document.createElement("li");

        li.className = "lap-item";

        if (lap.duration === bestLap) {

            li.classList.add("best");

        }

        if (
            lap.duration === slowestLap &&
            bestLap !== slowestLap
        ) {

            li.classList.add("slowest");

        }

        let badge = "";

        if (lap.duration === bestLap) {

            badge = `
                <span class="lap-badge best-badge">
                    BEST
                </span>
            `;

        }

        else if (
            lap.duration === slowestLap
        ) {

            badge = `
                <span class="lap-badge slowest-badge">
                    SLOWEST
                </span>
            `;

        }

        li.innerHTML = `

            <span class="lap-number">
                #${String(lap.number).padStart(2, "0")}
            </span>

            <span class="lap-time">
                ${formatLapTime(lap.duration)}
                ${badge}
            </span>

            <span class="total-time">
                ${formatTotalTime(lap.total)}
            </span>

        `;

        lapList.appendChild(li);

    });

    const count =
        stopwatch.laps.length;

    lapCount.textContent =
        `${count} ${count === 1 ? "Lap" : "Laps"}`;

}

function showLapFeedback() {

    lapButton.classList.add("lap-recorded");

    setTimeout(() => {

        lapButton.classList.remove(
            "lap-recorded"
        );

    }, 300);

}

function updateStatistics() {

    if (stopwatch.laps.length === 0) {

        bestLapElement.textContent =
            "--:---";

        averageLapElement.textContent =
            "--:---";

        slowestLapElement.textContent =
            "--:---";

        return;

    }

    const lapTimes =
        stopwatch.laps.map(
            lap => lap.duration
        );

    const best =
        Math.min(...lapTimes);

    const slowest =
        Math.max(...lapTimes);

    const total =
        lapTimes.reduce(
            (sum, time) =>
                sum + time,
            0
        );

    const average =
        total / lapTimes.length;

    bestLapElement.textContent =
        formatLapTime(best);

    averageLapElement.textContent =
        formatLapTime(average);

    slowestLapElement.textContent =
        formatLapTime(slowest);

}

function updatePerformance() {

    totalTimeElement.textContent =
        formatTotalTime(
            stopwatch.elapsedTime
        );

    totalLapsElement.textContent =
        stopwatch.laps.length;

    if (stopwatch.laps.length === 0) {

        trendChart.innerHTML = `

            <div class="chart-empty">

                <i class="fa-solid fa-chart-simple"></i>

                <span>
                    Record laps to see your
                    performance trend
                </span>

            </div>

        `;

        trendStatus.textContent = "—";

        trendStatus.className =
            "trend-status";

        return;
    }

    calculateTrend();

}

function renderTrendChart() {

    trendChart.innerHTML = "";

    const laps =
        stopwatch.laps
            .slice()
            .reverse();

    const times =
        laps.map(
            lap => lap.duration
        );

    const maxTime =
        Math.max(...times);

    laps.forEach((lap, index) => {

        const bar =
            document.createElement("div");

        bar.className =
            "chart-bar";

        const height =
            Math.max(
                12,
                (lap.duration / maxTime) * 100
            );

        bar.style.height =
            `${height}%`;

        bar.dataset.label =
            `L${index + 1}`;

        bar.dataset.time =
            formatLapTime(
                lap.duration
            );

        if (
            lap.duration ===
            Math.min(...times)
        ) {

            bar.classList.add(
                "best-bar"
            );

        }

        if (
            lap.duration ===
            Math.max(...times)
            &&
            Math.min(...times)
            !==
            Math.max(...times)
        ) {

            bar.classList.add(
                "slowest-bar"
            );

        }

        trendChart.appendChild(bar);

    });

}

function calculateTrend() {

    const laps =
        stopwatch.laps
            .slice()
            .reverse();

    if (laps.length < 2) {

        trendStatus.textContent =
            "NEUTRAL";

        trendStatus.className =
            "trend-status stable";

        return;

    }

    const times =
        laps.map(
            lap => lap.duration
        );

    const midpoint =
        Math.floor(
            times.length / 2
        );

    const firstHalf =
        times.slice(
            0,
            midpoint
        );

    const secondHalf =
        times.slice(
            midpoint
        );

    const firstAverage =
        firstHalf.reduce(
            (sum, time) =>
                sum + time,
            0
        ) / firstHalf.length;

    const secondAverage =
        secondHalf.reduce(
            (sum, time) =>
                sum + time,
            0
        ) / secondHalf.length;

    const difference =
        (
            (firstAverage - secondAverage)
            /
            firstAverage
        ) * 100;

    if (difference > 5) {

        trendStatus.textContent =
            "IMPROVING ↑";

        trendStatus.className =
            "trend-status improving";

    }

    else if (difference < -5) {

        trendStatus.textContent =
            "DECLINING ↓";

        trendStatus.className =
            "trend-status declining";

    }

    else {

        trendStatus.textContent =
            "STABLE →";

        trendStatus.className =
            "trend-status stable";

    }

}

function saveHistory() {

    if (
        stopwatch.elapsedTime === 0 ||
        (!stopwatch.isRunning &&
         stopwatch.laps.length === 0 &&
         stopwatch.elapsedTime < 1000)
    ) {
        return;
    }

    const session = {
        id: Date.now(),
        date: new Date().toISOString(),
        duration: stopwatch.elapsedTime,
        laps: stopwatch.laps.length,
        bestLap: stopwatch.laps.length
            ? Math.min(...stopwatch.laps.map(lap => lap.duration))
            : 0,
        averageLap: stopwatch.laps.length
            ? stopwatch.laps.reduce(
                (total, lap) => total + lap.duration,
                0
            ) / stopwatch.laps.length
            : 0,
        slowestLap: stopwatch.laps.length
            ? Math.max(...stopwatch.laps.map(lap => lap.duration))
            : 0,
    };

    sessionHistory.unshift(session);

    sessionHistory = sessionHistory.slice(0, 20);

    localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(sessionHistory)
    );

    renderHistory();
}

function renderHistory() {
    if (sessionHistory.length === 0) {
        historyList.innerHTML = `
            <div class="history-empty">
                <i class="fa-solid fa-clock-rotate-left"></i>

                <span>
                    No saved sessions yet
                </span>

                <small>
                    Complete a session to see it here
                </small>
            </div>
        `;

        return;
    }

    historyList.innerHTML = sessionHistory
        .map(session => {
            return `
                <div class="history-card">

                    <div class="history-card-header">

                        <div class="history-date">
                            <i class="fa-solid fa-calendar-day"></i>

                            <span>
                                ${formatHistoryDate(session.date)}
                            </span>

                            <span class="history-session-label">
                                Session
                            </span>
                        </div>

                        <div class="history-duration">
                            ${formatTotalTime(session.duration)}
                        </div>

                        <button
                            class="delete-session-button"
                            type="button"
                            title="Delete session"
                            data-id="${session.id}"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>


                    <div class="history-info">

                        <div class="history-stat laps">
                            <span class="history-stat-label">Laps</span>
                            <span class="history-stat-value">
                                ${session.laps}
                            </span>
                        </div>

                        <div class="history-stat best">
                            <span class="history-stat-label">Best</span>
                            <span class="history-stat-value">
                                ${formatLapTime(session.bestLap)}
                            </span>
                        </div>

                        <div class="history-stat average">
                            <span class="history-stat-label">Average</span>
                            <span class="history-stat-value">
                                ${formatLapTime(Math.round(session.averageLap))}
                            </span>
                        </div>

                        <div class="history-stat slowest">
                            <span class="history-stat-label">Slowest</span>
                            <span class="history-stat-value">
                                ${formatLapTime(session.slowestLap ?? 0)}
                            </span>
                        </div>

                    </div>


                </div>
            `;
        })
        .join("");
}

function formatHistoryDate(dateString) {

    const date = new Date(dateString);

    const now = new Date();

    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const sessionDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const difference =
        Math.floor(
            (today - sessionDate) /
            (1000 * 60 * 60 * 24)
        );

    if (difference === 0) {
        return "Today";
    }

    if (difference === 1) {
        return "Yesterday";
    }

    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

function deleteHistorySession(id) {
    sessionHistory = sessionHistory.filter(
        session => session.id !== id
    );
    localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(sessionHistory)
    );
    renderHistory();
}

clearHistoryButton.addEventListener("click", () => {
    if (sessionHistory.length === 0) {
        return;
    }
    historyAction = "clear";
    historyActionId = null;
    historyModalTitle.textContent =
        "Clear Session History?";
    historyModalMessage.textContent =
        "This will permanently remove all saved sessions.";
    confirmHistoryAction.innerHTML = `
        <i class="fa-solid fa-trash"></i>
        Clear All
    `;
    historyModal.classList.add("show");
});

historyList.addEventListener("click", event => {
    const deleteButton = event.target.closest(
        ".delete-session-button"
    );
    if (!deleteButton) {
        return;
    }
    const id = Number(deleteButton.dataset.id);
    const session = sessionHistory.find(
        item => item.id === id
    );
    if (!session) {
        return;
    }
    historyAction = "delete";
    historyActionId = id;
    historyModalTitle.textContent =
        "Delete This Session?";
    historyModalMessage.textContent =
        `Remove the ${formatHistoryDate(session.date)} session from your history?`;
    confirmHistoryAction.innerHTML = `
        <i class="fa-solid fa-trash"></i>
        Delete
    `;
    historyModal.classList.add("show");
});

cancelHistoryAction.addEventListener("click", () => {
    closeHistoryModal();
});


confirmHistoryAction.addEventListener("click", () => {
    if (historyAction === "clear") {
        sessionHistory = [];
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        renderHistory();
    } else if (
        historyAction === "delete" &&
        historyActionId !== null
    ) {
        deleteHistorySession(historyActionId);
    }
    closeHistoryModal();
});


function closeHistoryModal() {
    historyModal.classList.remove("show");
    historyAction = null;
    historyActionId = null;
}

startButton.addEventListener(
    "click",
    () => {
        if (stopwatch.isRunning) {
            stopwatch.stop();
        }
        else {
            stopwatch.start();
        }
    }
);

resetButton.addEventListener(
    "click",
    () => {
        if (
            stopwatch.elapsedTime === 0 &&
            stopwatch.laps.length === 0
        ) {
            return;
        }
        resetModal.classList.add("show");
    }
);

cancelResetButton.addEventListener(
    "click",
    () => {
        resetModal.classList.remove(
            "show"
        );
    }
);

confirmResetButton.addEventListener("click", () => {
    saveHistory();
    stopwatch.reset();
    resetModal.classList.remove("show");
});

lapButton.addEventListener(
    "click",
    () => {
        stopwatch.addLap();
    }
);

document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.code === "Space"
        ) {
            event.preventDefault();
            if (stopwatch.isRunning) {
                stopwatch.stop();
            }
            else {
                stopwatch.start();
            }
        }
        if (
            event.key.toLowerCase()
            === "l"
        ) {
            stopwatch.addLap();
        }
        if (
            event.key.toLowerCase()
            === "r"
        ) {
            if (
                stopwatch.elapsedTime === 0 &&
                stopwatch.laps.length === 0
            ) {
                return;
            }
            resetModal.classList.add(
                "show"
            );
        }
        if (event.key === "Escape") {
            resetModal.classList.remove("show");
            closeHistoryModal();
        }
    }
);

updateTimerDisplay(0);
renderLaps();
updateStatistics();
updatePerformance();
renderHistory();
stopwatch.updateUI();