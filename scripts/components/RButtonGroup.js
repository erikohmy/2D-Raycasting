class RButtonGroup {
    element = undefined;
    buttons = undefined;
    active = undefined;

    events = new EasyEvents();

    static className = "r-btngroup";
    static classNameBound = "r-js-bound";
    static classDisabled = "r-disabled";

    _disabled = false;

    // Events
    //  input
    //  change
    //  click

    constructor(element) {
        this.element = element;
        this.bind();
    }

    static make(element) {
        if (typeof element === "string") {
            element = document.querySelector(`[data-ref='${element}']`);
        }
        if (element.classList.contains(RButtonGroup.classNameBound)) {
            console.warn("RButtonGroup.make: element already bound", element);
            return false;
        }
        return new RButtonGroup(element);
    }

    get value() {
        if (!this.active) {
            return undefined;
        }
        return this.active.value;
    }
    set value(value) {
        if (value === this._value) return;

        this.buttons.forEach(button => {
            let buttonValue = button.value
            if (buttonValue == value) {
                this.active = button;
                this.active.element.classList.add("btn-active");
            } else {
                button.element.classList.remove("btn-active");
            }
        });

        this.events.trigger('input', this, this.value);
        this.events.trigger('change', this, this.value);
    }

    get disabled() {
        return this._disabled;
    }   
    set disabled(value) {
        if (value === this._disabled) return;
        this._disabled = value;
        if (value) {
            this.element.classList.add(RButtonGroup.classDisabled);
            this.buttons.forEach(button => {
                button.disabled = true;
            });
        } else {
            this.element.classList.remove(RButtonGroup.classDisabled);
            this.buttons.forEach(button => {
                button.disabled = false;
            });
        }
    }

    bind() {
        let elements = Array.from(this.element.getElementsByTagName("button"));
        this.buttons = elements.map(element => {
            let button = RButton.make(element);
            button.on('click', (target, value) => {
                this.value = value;
                this.events.trigger('click', this, value, target);
            });
            return button;
        });
        this.element.classList.add(RButtonGroup.classNameBound);
    }

    on(event, callback) {
        this.events.on(event, callback);
    }
}