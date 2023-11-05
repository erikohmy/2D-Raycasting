
class RComponent {
    element = undefined;
    events = new EasyEvents();

    static className = "r-component";
    static classNameBound = "r-js-bound";
    static classDisabled = "r-disabled";

    _disabled = false;

    constructor(element) {
        this.element = element;
    }

    static make(element) {
        if (typeof element === "string") {
            element = document.querySelector(`[data-ref='${element}']`);
        }
        if (element.classList.contains(this.classNameBound)) {
            console.warn(this.name + ".make: element already bound", element);
            return false;
        }  
        let component = new this(element); 
        if (typeof component.bind === 'function') {
            component.bind();
        }
        return component;
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
            this.element.classList.add(this.constructor.classDisabled);
            this.element.disabled = true;
        } else {
            this.element.classList.remove(this.constructor.classDisabled);
            this.element.disabled = false;
        }
        return this._disabled;
    }

    on(event, callback) {
        this.events.on(event, callback);
    }

    get html() {
        return this.element.innerHTML;
    }
    set html(value) {
        if (value === this.element.innerHTML) return false;
        this.element.innerHTML = value;
        return true;
    }
}