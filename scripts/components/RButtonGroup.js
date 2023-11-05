class RButtonGroup extends RComponent {
    buttons = undefined;
    active = undefined;

    static className = "r-btngroup";
    static classNameActive = "btn-active";

    // Events
    //  input
    //  change
    //  click

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
                this.active.element.classList.add(this.constructor.classNameActive);
            } else {
                button.element.classList.remove(this.constructor.classNameActive);
            }
        });

        this.events.trigger('input', this, this.value);
        this.events.trigger('change', this, this.value);
    }

    get disabled() {
        return this._disabled;
    }   
    set disabled(value) {
        if (value === this._disabled) return this._disabled;

        this._disabled = value;
        if (value) {
            this.element.classList.add(this.constructor.classDisabled);
            this.element.disabled = true;
            this.buttons.forEach(button => {
                button.disabled = true;
            });
        } else {
            this.element.classList.remove(this.constructor.classDisabled);
            this.element.disabled = false;
            this.buttons.forEach(button => {
                button.disabled = false;
            });
        }
        return this._disabled;
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
}