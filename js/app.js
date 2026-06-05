let currentSpeed = 0;
let watchId = null;

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
// Speed Limit Check
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

    } else {

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
// Update Speed UI
// ======================

function updateSpeed(speed) {

    currentSpeed = speed;

    speedDisplay.textContent =
        Math.round(speed);

    gauge.set(speed);

    checkLimit(speed);
}


// ======================
// GPS Tracking
// ======================

function startTracking() {

    if (!navigator.geolocation) {

        alert(
            "Geolocation is not supported by this browser."
        );

        return;
    }

    gpsStatus.textContent =
        "- CONNECTING GPS -";

    gpsStatus.className =
        "gps-status connecting";

    watchId =
        navigator.geolocation.watchPosition(

            function(position) {

                gpsStatus.textContent =
                    "- GPS ACTIVE -";

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

                gpsStatus.textContent =
                    "- GPS ERROR -";

                gpsStatus.className =
                    "gps-status offline";

                startButton.disabled =
                    false;

                console.log(error);

                alert(
                    "Location permission is required for speed tracking."
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
// Preset Speed Buttons
// ======================

presetButtons.forEach(button => {

    button.addEventListener("click", () => {

        const speed =
            button.dataset.speed;

        speedLimitInput.value =
            speed;

        presetButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");
    });

});


// Default Selected Limit

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
// Start Tracking Button
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
// Initial GPS Status
// ======================

gpsStatus.textContent =
    "- GPS OFF -";

gpsStatus.className =
    "gps-status offline";