let currentSpeed = 0;
let watchId = null;
let wakeLock = null;


// ======================
// ELEMENTS
// ======================

const speedDisplay =
    document.getElementById("speed");

const speedLimitInput =
    document.getElementById("speedLimit");

const alertSound =
    document.getElementById("alertSound");

const startButton =
    document.getElementById("startTracking");

const testSlider =
    document.getElementById("testSlider");

const testValue =
    document.getElementById("testValue");

const warningBanner =
    document.getElementById("warningBanner");

const presetButtons =
    document.querySelectorAll(".preset-btn");

const gpsStatus =
    document.getElementById("gpsStatus");

const sourceStatus =
    document.getElementById("sourceStatus");

const motionStatus =
    document.getElementById("motionStatus");

const accX =
    document.getElementById("accX");

const accY =
    document.getElementById("accY");

const accZ =
    document.getElementById("accZ");

const accMag =
    document.getElementById("accMag");

const wakeLockBtn =
    document.getElementById("wakeLockBtn");

const wakeLockStatus =
    document.getElementById("wakeLockStatus");


// ======================
// GAUGE SETUP
// ======================

const opts = {

    angle: -0.2,

    lineWidth: 0.25,

    radiusScale: 1,

    pointer: {

        length: 0.6,

        strokeWidth: 0.035

    },

    limitMax: false,

    limitMin: false,

    colorStart: "#ffffff",

    colorStop: "#ffffff",

    strokeColor: "#333",

    highDpiSupport: true
};

const target =
    document.getElementById("gauge");

const gauge =
    new Gauge(target).setOptions(opts);

gauge.maxValue = 180;

gauge.setMinValue(0);

gauge.animationSpeed = 32;

gauge.set(0);


// ======================
// WAKE LOCK
// ======================

async function enableWakeLock() {

    try {

        if (
            !("wakeLock" in navigator)
        ) {

            wakeLockStatus.textContent =
                "Screen Awake: Unsupported";

            return;
        }

        wakeLock =
            await navigator.wakeLock.request(
                "screen"
            );

        wakeLockStatus.textContent =
            "Screen Awake: ON";

        wakeLockBtn.textContent =
            "Screen Awake Enabled";

        wakeLockBtn.disabled =
            true;

    }
    catch (error) {

        console.error(error);

        wakeLockStatus.textContent =
            "Screen Awake: Error";
    }
}

document.addEventListener(
    "visibilitychange",
    async () => {

        if (
            wakeLock &&
            document.visibilityState ===
            "visible"
        ) {

            try {

                wakeLock =
                    await navigator.wakeLock.request(
                        "screen"
                    );

            }
            catch (err) {

                console.error(err);

            }
        }
    }
);

if (wakeLockBtn) {

    wakeLockBtn.addEventListener(
        "click",
        enableWakeLock
    );
}


// ======================
// SPEED LIMIT CHECK
// ======================

function checkLimit(speed) {

    const limit =
        Number(speedLimitInput.value);

    if (speed > limit) {

        document.body.classList.add(
            "alert-active"
        );

        warningBanner.style.display =
            "block";

        if (
            alertSound &&
            alertSound.paused
        ) {

            alertSound.play()
                .catch(() => {});

        }

    }
    else {

        document.body.classList.remove(
            "alert-active"
        );

        warningBanner.style.display =
            "none";

        if (alertSound) {

            alertSound.pause();

            alertSound.currentTime =
                0;
        }
    }
}


// ======================
// UPDATE SPEED
// ======================

function updateSpeed(speed) {

    currentSpeed = speed;

    speedDisplay.textContent =
        Math.round(speed);

    gauge.set(speed);

    checkLimit(speed);
}


// ======================
// MOTION SENSOR
// ======================

async function startMotionDetection() {

    try {

        if (
            typeof DeviceMotionEvent ===
            "undefined"
        ) {

            if (motionStatus) {

                motionStatus.textContent =
                    "Motion Sensor: Not Supported";
            }

            return;
        }

        if (
            typeof DeviceMotionEvent
                .requestPermission ===
            "function"
        ) {

            const permission =
                await DeviceMotionEvent
                    .requestPermission();

            if (
                permission !==
                "granted"
            ) {

                if (motionStatus) {

                    motionStatus.textContent =
                        "Motion Sensor: Permission Denied";
                }

                return;
            }
        }

        if (motionStatus) {

            motionStatus.textContent =
                "Motion Sensor: Active";

            motionStatus.className =
                "sensor-active";
        }

        window.addEventListener(
            "devicemotion",
            event => {

                const acc =
                    event.accelerationIncludingGravity;

                if (!acc) {
                    return;
                }

                const x =
                    Number(acc.x || 0);

                const y =
                    Number(acc.y || 0);

                const z =
                    Number(acc.z || 0);

                const magnitude =
                    Math.sqrt(
                        x * x +
                        y * y +
                        z * z
                    );

                if (accX) {

                    accX.textContent =
                        `Acc X: ${x.toFixed(2)}`;
                }

                if (accY) {

                    accY.textContent =
                        `Acc Y: ${y.toFixed(2)}`;
                }

                if (accZ) {

                    accZ.textContent =
                        `Acc Z: ${z.toFixed(2)}`;
                }

                if (accMag) {

                    accMag.textContent =
                        `Magnitude: ${magnitude.toFixed(2)}`;
                }

                if (magnitude > 12) {

                    gpsStatus.textContent =
                        "● MOTION DETECTED";

                    sourceStatus.textContent =
                        "SOURCE: MOTION SENSOR";
                }

            }
        );

    }
    catch (error) {

        console.error(error);

    }
}


// ======================
// GPS TRACKING
// ======================

function startTracking() {

    enableWakeLock();

    if (
        !navigator.geolocation
    ) {

        alert(
            "Geolocation not supported."
        );

        startMotionDetection();

        return;
    }

    gpsStatus.textContent =
        "● CONNECTING GPS";

    gpsStatus.className =
        "gps-status connecting";

    sourceStatus.textContent =
        "SOURCE: GPS (CONNECTING)";

    watchId =
        navigator.geolocation.watchPosition(

            position => {

                gpsStatus.textContent =
                    "● GPS ACTIVE";

                gpsStatus.className =
                    "gps-status online";

                sourceStatus.textContent =
                    "SOURCE: GPS";

                startButton.textContent =
                    "TRACKING ACTIVE";

                startButton.disabled =
                    true;

                let speed =
                    position.coords.speed;

                if (
                    speed === null ||
                    speed === undefined
                ) {

                    speed = 0;
                }

                speed =
                    speed * 3.6;

                updateSpeed(speed);

            },

            error => {

                console.error(error);

                gpsStatus.textContent =
                    "● GPS FAILED";

                gpsStatus.className =
                    "gps-status offline";

                sourceStatus.textContent =
                    "SOURCE: MOTION SENSOR";

                startMotionDetection();

                alert(
                    "GPS unavailable. Motion sensor activated."
                );

            },

            {

                enableHighAccuracy:
                    true,

                maximumAge: 0,

                timeout: 10000

            }
        );
}


// ======================
// SPEED PRESETS
// ======================

presetButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const speed =
                    button.dataset.speed;

                speedLimitInput.value =
                    speed;

                presetButtons.forEach(
                    btn =>
                    btn.classList.remove(
                        "active"
                    )
                );

                button.classList.add(
                    "active"
                );

            }
        );

    }
);


// ======================
// DEFAULT PRESET
// ======================

const defaultButton =
    document.querySelector(
        '[data-speed="60"]'
    );

if (defaultButton) {

    defaultButton.classList.add(
        "active"
    );
}


// ======================
// START BUTTON
// ======================

startButton.addEventListener(
    "click",
    startTracking
);


// ======================
// TEST MODE
// ======================

testSlider.addEventListener(
    "input",
    function () {

        const speed =
            Number(this.value);

        testValue.textContent =
            `Test Speed: ${speed} km/h`;

        sourceStatus.textContent =
            "SOURCE: TEST MODE";

        updateSpeed(speed);

    }
);


// ======================
// INITIAL STATUS
// ======================

gpsStatus.textContent =
    "● GPS OFF";

gpsStatus.className =
    "gps-status offline";

if (sourceStatus) {

    sourceStatus.textContent =
        "SOURCE: NONE";
}

if (motionStatus) {

    motionStatus.textContent =
        "Motion Sensor: Waiting";

    motionStatus.className =
        "sensor-inactive";
}

if (wakeLockStatus) {

    wakeLockStatus.textContent =
        "Screen Awake: OFF";
}
