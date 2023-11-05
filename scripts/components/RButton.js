
class RButton {
    element = undefined;

    events = new EasyEvents();

    static className = "r-btn";
    static classNameBound = "r-js-bound";
    static classDisabled = "r-disabled";

    _disabled = false;

    constructor(element) {
        this.element = element;
        this.bind();
    }

    static make(element) {
        if (typeof element === "string") {
            element = document.querySelector(`[data-ref='${element}']`);
        }
        if (element.classList.contains(RButton.classNameBound)) {
            console.warn("RButton.make: element already bound", element);
            return false;
        }
        return new RButton(element);
    }

    get value() {
        return this.element.getAttribute("value");
    }

    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        if (value === this._disabled) return this._disabled;
        this._disabled = value;
        if (value) {
            this.element.classList.add(RButton.classDisabled);
            this.element.disabled = true;
        } else {
            this.element.classList.remove(RButton.classDisabled);
            this.element.disabled = false;
        }
        return this._disabled;
    }

    bind() {
        this.element.addEventListener("click", () => {
            let value = this.element.getAttribute("value");
            this.events.trigger('click', this, value);
        });
        this.element.classList.add(RButton.classNameBound);
    }

    on(event, callback) {
        this.events.on(event, callback);
    }
}