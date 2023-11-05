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
        let viewSelector = RButtonGroup.make(document.getElementById("view-selector"));
        viewSelector.on('input', (target, value) => {
            this.view = value;
        });
        this.addInput('viewSelector', viewSelector);

        let menuMain = RMenu.make("main-menu");
        menuMain.on('option-clicked', (target, option) => {
            console.log(option);
        });
        menuMain.generateHtml(testoptions);
        this.addInput('menuMain', menuMain);
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
}