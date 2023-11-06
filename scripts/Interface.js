class Interface {

    _view = undefined;

    views = ['editor', 'split', 'dynamic', 'view'];

    constructor() {
        this.events = new EasyEvents();
        this.bind();

        this.view = "split";
    }

    _inputs = [];

    set view(value) {
        if (value !== this._view) {
            this._view = value;
            
            let main = document.getElementById("main");
            let classes = this.views.map(view => {
                return "view-" + view;
            });
            DOMTokenList.prototype.remove.apply(main.classList, classes);
            main.classList.add("view-" + value);

            this.updateInput('viewSelector', value);
        }
    }
    get view() {
        return this._view;
    }

    // Handle inputs, like buttons, sliders, menus, etc.
    bind() {
        let viewSelector = RButtonGroup.make("view-selector");
        viewSelector.on('input', (target, value) => {
            this.view = value;
        });
        this.addInput('viewSelector', viewSelector);

        let menuMain = RMenu.make("main-menu");
        menuMain.on('option-clicked', (target, option) => {
            console.log(option);
            if (option?.name === 'gridsize') {
                let size = Number(this.getOption('gridsize'));
                engine.gridSize = size;
            }

            let event = option?.event;
            if (event) {
                this.events.trigger(event, target, option);
                engine.events.trigger(event, target, option);
            }
            //console.log(target.getOptions())
        });
        menuMain.generateHtml(testoptions);
        this.addInput('menuMain', menuMain);

        // actions
        this.events.on("action-download-world", () => {
            this.actionDownload();
        });
    }

    getOptions() {
        let menuOptions = this.getInput('menuMain').getOptions();
        // if we add more options, we can add them here
        return menuOptions;
    }

    getOption(name) {
        let options = this.getOptions();
        return options[name];
    }

    setOption(name, value) {
        this.getInput('menuMain').setOption(name, value);
    }

    addInput(name, handler) {
        this._inputs.push({
            name: name,
            handler: handler
        });
    }

    getInput(name) {
        let inputs = this.getInputs(name);
        return inputs.length > 0 ? inputs[0] : undefined;
    }
    getInputs(name) {
        return this._inputs.filter(inputRef => {
            return inputRef.name === name;
        }).map(inputRef => {
            return inputRef.handler;
        });
    }
    updateInput(name, value) {
        let inputs = this.getInputs(name);
        inputs.forEach(input => {
            input.value = value;
        });
    }

    /////// Interface actions ///////
    actionDownload() {
        let data = engine.exportWorldToJSON();
        let blob = new Blob([data], { type: "application/json" });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
    
        let date = new Date();
        let datestring = date.toISOString().split("T")[0] + " " + date.toTimeString().split(" ")[0];
        a.download = "world-" + datestring + ".world.json";
        a.click();
    }
}