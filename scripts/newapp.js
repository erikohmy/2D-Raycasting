let scripts = [
    "scripts/Vector2D.js",
    "scripts/EasyEvents.js",
    "scripts/Plane.js",
    "scripts/World.js",
    "scripts/Raycaster.js",
    "scripts/RaycastDisplay.js",
    "scripts/Engine2dot5D.js",
    "scripts/Interface.js",

    "scripts/components/RButton.js",
    "scripts/components/RButtonGroup.js",
];
let interface;
let engine;
addEventListener('load', () => {
    loadScripts().then(() => {
        start();
    });
});

function start() {
    console.log("loaded");
    interface = new Interface();

    let canvas = document.getElementById("panel")
    engine = new Engine2dot5D(canvas);
    setTimeout(() => {
        canvas.focus();
    }, 10);
    loadTestWorld();
}

function loadScripts() {
    return new Promise((resolve) => {
        let loaded = 0;
        scripts.forEach((script) => {
            let s = document.createElement("script");
            s.type = "text/javascript";
            s.onload = () => {
                loaded++;
                if (loaded == scripts.length) {
                    resolve();
                }
            };
            s.src = script;
            document.body.appendChild(s);
        });
    });
}

function loadTestWorld() {
    let s = document.createElement("script");
    s.type = "text/javascript";
    s.onload = () => {
        engine.importWorldFromJSON(testworlds["testworld 1"]);
    };
    s.src = "resources/testworld.js";
    document.body.appendChild(s);
}