
class RButton extends RComponent {
    static className = "r-btn";

    bind() {
        this.element.addEventListener("click", () => {
            let value = this.element.getAttribute("value");
            this.events.trigger('click', this, value);
        });
    }
}