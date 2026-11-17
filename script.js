
const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");
const millisecondsDisplay = document.getElementById("milliseconds");

const startBtn = document.getElementById("start-btn");
const lapBtn = document.getElementById("lap-btn");
const resetBtn = document.getElementById("reset-btn");

const lapsList = document.getElementById("laps-list");
const lapCount = document.getElementById("lap-count");
const fastestLapDisplay = document.getElementById("fastest-lap");
const slowestLapDisplay = document.getElementById("slowest-lap");
const averageLapDisplay = document.getElementById("average-lap");

let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;
let laps = [];

// Convert milliseconds into MM:SS:CC format
function formatTime(time) {
    const totalCentiseconds = Math.floor(time / 10);

    const minutes = Math.floor(totalCentiseconds / 6000);
    const seconds = Math.floor((totalCentiseconds % 6000) / 100);
    const centiseconds = totalCentiseconds % 100;

    return {
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
        centiseconds: String(centiseconds).padStart(2, "0")
    };
}

// Display the stopwatch time
function updateDisplay() {
    const time = formatTime(elapsedTime);

    minutesDisplay.textContent = time.minutes;
    secondsDisplay.textContent = time.seconds;
    millisecondsDisplay.textContent = time.centiseconds;
}

// Start the stopwatch
function startStopwatch() {
    if (isRunning) {
        pauseStopwatch();
        return;
    }

    startTime = performance.now() - elapsedTime;
    isRunning = true;

    timerInterval = setInterval(() => {
        elapsedTime = performance.now() - startTime;
        updateDisplay();
    }, 10);

    startBtn.textContent = "Pause";
    lapBtn.disabled = false;
    resetBtn.disabled = false;
}

// Pause the stopwatch
function pauseStopwatch() {
    if (!isRunning) return;

    elapsedTime = performance.now() - startTime;

    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;

    updateDisplay();

    startBtn.textContent = "Resume";
    lapBtn.disabled = true;
}

// Reset the stopwatch
function resetStopwatch() {
    clearInterval(timerInterval);
    timerInterval = null;

    elapsedTime = 0;
    startTime = 0;
    isRunning = false;
    laps = [];

    updateDisplay();
    renderLaps();

    startBtn.textContent = "Start";
    lapBtn.disabled = true;
    resetBtn.disabled = true;
}

// Record a lap
function recordLap() {
    if (!isRunning) return;

    const lapTime = elapsedTime;
    const previousLapTime = laps.length > 0
        ? laps[laps.length - 1].total
        : 0;

    laps.push({
        number: laps.length + 1,
        split: lapTime - previousLapTime,
        total: lapTime
    });

    renderLaps();
}

// Display lap history
function renderLaps() {
    lapsList.innerHTML = "";

    lapCount.textContent = `${laps.length} ${laps.length === 1 ? "Lap" : "Laps"}`;
if (laps.length === 0) {
    lapsList.innerHTML = `
        <li class="empty-message">
            Your lap times will appear here.
        </li>
    `;

    updateLapStatistics();
    return;
}

    [...laps].reverse().forEach((lap) => {
        const split = formatTime(lap.split);
        const total = formatTime(lap.total);

        const li = document.createElement("li");
        li.className = "lap-item";

        li.innerHTML = `
            <span>#${lap.number}</span>
            <span>${split.minutes}:${split.seconds}.${split.centiseconds}</span>
            <span>${total.minutes}:${total.seconds}.${total.centiseconds}</span>
        `;

        lapsList.appendChild(li);
        updateLapStatistics();
    });
}

function updateLapStatistics() {
    if (laps.length === 0) {
        fastestLapDisplay.textContent = "--:--.--";
        slowestLapDisplay.textContent = "--:--.--";
        averageLapDisplay.textContent = "--:--.--";
        return;
    }

    // Find the fastest and slowest individual laps
    const lapTimes = laps.map(lap => lap.split);

    const fastest = Math.min(...lapTimes);
    const slowest = Math.max(...lapTimes);

    // Calculate mean lap time
    const total = lapTimes.reduce((sum, time) => sum + time, 0);
    const average = total / lapTimes.length;

    // Format and display statistics
    function displayTime(time) {
        const formatted = formatTime(time);

        return `${formatted.minutes}:${formatted.seconds}.${formatted.centiseconds}`;
    }

    fastestLapDisplay.textContent = displayTime(fastest);
    slowestLapDisplay.textContent = displayTime(slowest);
    averageLapDisplay.textContent = displayTime(average);
}


// Button events
startBtn.addEventListener("click", startStopwatch);
lapBtn.addEventListener("click", recordLap);
resetBtn.addEventListener("click", resetStopwatch);

// Initial display
updateDisplay();
renderLaps();
