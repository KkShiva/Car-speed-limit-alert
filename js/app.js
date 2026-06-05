let currentSpeed = 0;
let watchId = null;


// ======================
// Elements
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
// ======================
// Gauge Setup
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
// Warning Logic
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

        if (alertSound.paused) {

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

        alertSound.pause();

        alertSound.currentTime = 0;
    }
}


// ======================
// Update Speed
// ======================

function updateSpeed(speed) {

    currentSpeed = speed;

    speedDisplay.textContent =
        Math.round(speed);

    gauge.set(speed);

    checkLimit(speed);
}


// ======================
// Motion Sensor Fallback
// ======================

function startMotionDetection() {

    if (
        typeof DeviceMotionEvent ===
        "undefined"
    ) {

        motionStatus.textContent =
            "Motion Sensor: Not Supported";

        return;
    }

    motionStatus.textContent =
        "Motion Sensor: Active";

    motionStatus.className =
        "sensor-active";

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

            accX.textContent =
                `Acc X: ${x.toFixed(2)}`;

            accY.textContent =
                `Acc Y: ${y.toFixed(2)}`;

            accZ.textContent =
                `Acc Z: ${z.toFixed(2)}`;

            accMag.textContent =
                `Magnitude: ${magnitude.toFixed(2)}`;

            if (magnitude > 12) {

                gpsStatus.textContent =
                    "? MOTION DETECTED";

                sourceStatus.textContent =
                    "SOURCE: MOTION SENSOR";

            }

        }
    );
}


// ======================
// GPS Tracking
// ======================

function startTracking() {

    if (!navigator.geolocation) {

        alert(
            "Geolocation is not supported."
        );

        return;
    }

    gpsStatus.textContent =
        "? CONNECTING GPS";

    gpsStatus.className =
        "gps-status connecting";

    watchId =
        navigator.geolocation.watchPosition(

            function(position) {

                gpsStatus.textContent =
                    "? GPS ACTIVE";

                gpsStatus.className =
                    "gps-status online";

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

            function(error) {

                console.log(error);

                gpsStatus.textContent =
                    "? GPS FAILED";

                gpsStatus.className =
                    "gps-status offline";

                startMotionDetection();

                alert(
                    "GPS unavailable. Motion sensor fallback activated."
                );

            },

            {

                enableHighAccuracy: true,

                maximumAge: 0,

                timeout: 10000

            }
        );
}


// ======================
// Speed Presets
// ======================

presetButtons.forEach(button => {

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

});


// Default preset

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
// Start Tracking
// ======================

startButton.addEventListener(
    "click",
    startTracking
);


// ======================
// Test Mode
// ======================

testSlider.addEventListener(
    "input",
    function() {

        const speed =
            Number(this.value);

        testValue.textContent =
            `Test Speed: ${speed} km/h`;

        updateSpeed(speed);
    }
);


// ======================
// Initial Status
// ======================

gpsStatus.textContent =
    "? GPS OFF";

gpsStatus.className =
    "gps-status offline";

sourceStatus.textContent =
    "SOURCE: NONE";
    
motionStatus.textContent =
    "Motion Sensor: Waiting";

motionStatus.className =
    "sensor-inactive";