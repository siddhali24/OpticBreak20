const TIMER_DURATION = 20 * 60 * 1000;  // 20 minute rule session [change to 1 for testing locally]
const BREAK_DURATION = 20 * 1000;      // 20 seconds mandatory break
let endTime = null;
let timerInterval = null;
let isRunning = false;
const alarm = new Audio("assets/alarm.mp3");
alarm.loop = true;

const timerDisplay = document.getElementById("timer");
const floatingTimer = document.getElementById("floatingTimer");
const popup = document.getElementById("popup");
const breakTimer = document.getElementById("breakTimer");
const dismissBtn = document.getElementById("dismissBtn");

if ("Notification" in window) Notification.requestPermission();
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => { });
}

function startTimer(duration) {
    if (isRunning) return;
    endTime = Date.now() + duration;
    isRunning = true;
    localStorage.setItem("endTime", endTime);
    clearInterval(timerInterval);
    timerInterval = setInterval(tick, 500);
    tick();
}

function tick() {
    if (!endTime) return;
    const remaining = endTime - Date.now();

    if (remaining <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        setDisplays("00:00");
        triggerAlarm();
        return;
    }

    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    setDisplays(`${m}:${s.toString().padStart(2, "0")}`);
}

function setDisplays(text) {
    timerDisplay.textContent = text;
    floatingTimer.textContent = text;
}
let deferredPrompt;
const pwaBtn = document.getElementById("pwaInstallBtn");

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (pwaBtn) pwaBtn.classList.remove("hidden");
});

if (pwaBtn) {
    pwaBtn.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            pwaBtn.classList.add("hidden");
        }
        deferredPrompt = null;
    });
}

function triggerAlarm() {
    alarm.play().catch(() => { });
    if (navigator.vibrate) navigator.vibrate([500, 300, 500, 300]);

    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("👀 Eye Break Time!", {
            body: "Look 20 ft away • Hydrate • Stretch!",
            icon: "icons/image.png"
        });
    }
    popup.classList.remove("hidden");
    localStorage.removeItem("endTime");
    startBreakCountdown();
}

function startBreakCountdown() {
    let secondsLeft = 20;
    breakTimer.textContent = secondsLeft;
    dismissBtn.disabled = true;
    dismissBtn.textContent = `Please wait ${secondsLeft}s...`;

    const breakInterval = setInterval(() => {
        secondsLeft--;
        breakTimer.textContent = secondsLeft;
        dismissBtn.textContent = `Please wait ${secondsLeft}s...`;

        if (secondsLeft <= 0) {
            clearInterval(breakInterval);
            completeBreak();
        }
    }, 1000);
}

function completeBreak() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#a5b4fc', '#ffffff']
        });
    }

    dismissBtn.disabled = false;
    dismissBtn.textContent = "✅ Done! Restart Loop";
    breakTimer.textContent = "✓";
}

function dismissPopup() {
    popup.classList.add("hidden");
    alarm.pause();
    alarm.currentTime = 0;
    startTimer(TIMER_DURATION);
}

function stopTimer() {
    clearInterval(timerInterval);
    alarm.pause();
    alarm.currentTime = 0;
    popup.classList.add("hidden");
    endTime = null;
    isRunning = false;
    localStorage.removeItem("endTime");
    setDisplays(formatDuration(TIMER_DURATION));
}
function formatDuration(ms) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

document.getElementById("startBtn").onclick = () => startTimer(TIMER_DURATION);
document.getElementById("stopBtn").onclick = stopTimer;
document.getElementById("dismissBtn").onclick = dismissPopup;

window.onload = function () {
    setDisplays(formatDuration(TIMER_DURATION));
    const saved = localStorage.getItem("endTime");
    if (saved) {
        endTime = parseInt(saved);
        if (Date.now() < endTime) {
            isRunning = true;
            timerInterval = setInterval(tick, 500);
            tick();
        } else {
            localStorage.removeItem("endTime");
            triggerAlarm();
        }
    }
};

window.addEventListener("beforeunload", (e) => {
    if (isRunning) {
        e.preventDefault();
        e.returnValue = "";
    }
});