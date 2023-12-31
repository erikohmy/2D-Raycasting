let engine;
let dialogVisible = false;
let scripts = [
    "scripts/Vector2D.js",
    "scripts/EasyEvents.js",
    "scripts/Plane.js",
    "scripts/World.js",
    "scripts/Raycaster.js",
    "scripts/RaycastDisplay.js",
    "scripts/Engine2dot5D.js"
];
function init() {
    let fileinput = document.getElementById("filejson")
    fileinput.addEventListener("change", () => {
        readFile(fileinput).then((data) => {
            if (data) {
                let textarea = document.getElementById("datajson");
                textarea.value = data;
                actionImport();
            }
        });
    });

    let opacitySlider = document.getElementById("optionsOpacity");
    opacitySlider.addEventListener("input", () => {
        let display = document.getElementById("optionsOpacityValue");
        display.innerText = opacitySlider.value * 100 + "%";
    });
    
    loadScripts().then(() => {
        start();
    });
}

function start() {
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

function actionExport() {
    let data = engine.exportWorldToJSON();
    let textarea = document.getElementById("datajson");
    textarea.value = data;
}

function actionImport() {
    if (dialogVisible) {
        let textarea = document.getElementById("datajson");
        let data = textarea.value;
        engine.importWorldFromJSON(data);
        hideJsonDialogue();
        engine.canvas.focus();
    }
}

function actionDownload() {
    let data = engine.exportWorldToJSON();
    let blob = new Blob([data], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;

    let date = new Date();
    let datestring = date.toISOString().split("T")[0] + " " + date.toTimeString().split(" ")[0];
    a.download = "world-" + datestring + ".world.json";
    a.click();
    //a.remove();
}

function readFile(input, type = "text") {
    return new Promise((resolve) => {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const text = e.target.result;
                resolve(reader.result);
            };
            if (type == "text") {
                reader.readAsText(input.files[0]);
            } else if (type == "DataURL") {
                reader.readAsDataURL(input.files[0]);
            }
        } else {
            throw new Error("No file was found");
        }
    });
}


function showJsonDialogue() {
    actionExport();
    let dialog = document.getElementById("export-dialog");
    let engineWindow = document.getElementById("engine-window");
    engineWindow.classList.add("hide");
    dialog.classList.remove("hide");
    dialogVisible = true;
}
function hideJsonDialogue() {
    let dialog = document.getElementById("export-dialog");
    let engineWindow = document.getElementById("engine-window");
    dialog.classList.add("hide");
    engineWindow.classList.remove("hide");
    dialogVisible = false;
}
function actionToggleDialog() {
    if(dialogVisible) {
        hideJsonDialogue();
    } else {
        showJsonDialogue();
    }
}