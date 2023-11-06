let scripts = [
    "scripts/Vector2D.js",
    "scripts/EasyEvents.js",
    "scripts/Plane.js",
    "scripts/World.js",
    "scripts/Raycaster.js",
    "scripts/RaycastDisplay.js",
    "scripts/Engine2dot5D.js",
    "scripts/Interface.js",

    "scripts/components/RComponent.js",
    "scripts/components/RButton.js",
    "scripts/components/RButtonGroup.js",
    "scripts/components/RMenu.js",
];
let engineInterface;
let engine;
addEventListener('load', () => {
    loadScripts().then(start);
});

function start() {
    document.getElementById("main").classList.remove("loading");
    engineInterface = new Interface();

    let canvas = document.getElementById("panel")
    engine = new Engine2dot5D(canvas);
    setTimeout(() => {
        canvas.focus();
    }, 10);
    loadTestWorld();
}

async function loadScripts() {
    for (let src of scripts) {
        await loadScript(src);
    }
}
function loadScript(src) {
    return new Promise((resolve) => {
        let s = document.createElement("script");
        s.type = "text/javascript";
        s.onload = () => {
            resolve();
        };
        s.src = src;
        document.body.appendChild(s);
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