let testoptions = [
    {
        text: "File",
        options: [
            {
                type: "button",
                text: "New",
                name: "reset-world",
                event: "action-reset-world"
            },
            {
                type: "button",
                text: "Open",
                name: "open-world",
                event: "action-open-world",
                disabled: true
            },
            {
                type: "button",
                text: "Download",
                name: "download-world",
                event: "action-download-world"
            },
        ]
    },
    {
        text: "Tools",
        options: [
            {type: "radio", text: "Select", name: "tool", value: "select", event: "selected-tool"},
            {type: "radio", text: "Create plane", name: "tool", value: "plane", event: "selected-tool", checked: true},
        ]
    },
    {
        text: "View",
        options: [
            {
                text: "Grid",
                options: [
                    {
                        type: "radio",
                        text: "128x128",
                        name: "gridsize",
                        value: "128",
                    },
                    {
                        type: "radio",
                        text: "64x64",
                        name: "gridsize",
                        value: "64",
                    },
                    {
                        type: "radio",
                        text: "32x32",
                        name: "gridsize",
                        value: "32",
                        checked: true
                    },
                    {
                        type: "radio",
                        text: "16x16",
                        name: "gridsize",
                        value: "16",
                    },
                    {
                        type: "radio",
                        text: "8x8",
                        name: "gridsize",
                        value: "8",
                    },
                ]
            }
        ]
    },
    {
        text: "Plane options",
        options: [
            {
                text: "Color",
                options: [
                    {type: "button", text: "Custom", name: "color", value: "custom", disabled: true},
                    {type: "separator"},
                    {type: "radio", text: "Random", name: "color", value: undefined, checked: true},
                    {type: "radio", text: "Transparent", name: "color", value: "#00000000"},
                    {type: "radio", text: "Grey", name: "color", value: "#444444ff"},
                    {type: "radio", text: "Red", name: "color", value: "#ff0000ff"},
                    {type: "radio", text: "Green", name: "color", value: "#00ff00ff"},
                    {type: "radio", text: "Blue", name: "color", value: "#0000ffff"},
                    {type: "radio", text: "Black", name: "color", value: "#000000ff"},
                    {type: "radio", text: "LightBlue", name: "color", value: "#0099ffff"}
                ]
            },
            {
                text: "Opacity",
                options: [
                    {type: "button", text: "Custom", name: "opacity", value: "custom", disabled: true},
                    {type: "separator"},
                    {type: "radio", text: "100%", name: "opacity", value: "1.0", checked: true},
                    {type: "radio", text: "75%", name: "opacity", value: "0.75"},
                    {type: "radio", text: "50%", name: "opacity", value: "0.50"},
                    {type: "radio", text: "25%", name: "opacity", value: "0.25"},
                    {type: "radio", text: "10%", name: "opacity", value: "0.10"},
                    {type: "radio", text: "0%", name: "opacity", value: "0.0"}  
                ]
            },
            {
                text: "Texture",
                options: [
                    {type: "radio", text: "None", name: "texture", value: undefined, checked: true},
                    {type: "separator"},
                    {type: "radio", text: "Concrete", name: "texture", value: "concrete1"},
                    {type: "radio", text: "Concrete Pillar", name: "texture", value: "concrete_pillar"},
                    {type: "radio", text: "Grate", name: "texture", value: "grate"},
                    {type: "radio", text: "Debug", name: "texture", value: "debug"}
                ]
            },
            {type: "separator"},
            {type: "check", text: "Mirror", name: "mirror"},
            {type: "check", text: "Opaque", name: "opaque", checked: true},
            {type: "check", text: "Solid", name: "solid", checked: true},
        ]
    }
];

class RMenu extends RComponent {
    options = [];
    namePrefix = "rmenu-";
    inputs = [];
    static className = "r-menu";
    static classNameHasChildren = "r-menu-has-children";
    generateHtml(options) {
        if (! (options instanceof Array)) {
            options = this.options;
        }
        let menu = this.buildOptions(options);
        this.html = "";
        menu.forEach((item) => {
            this.element.appendChild(item);
        });
    }

    generateIndexedId(current, id) {
        let count = 0;
        for (let item of current) {
            if (item === id) {
                count++;
            }
        }
        return id + "-" + count;
    }

    buildOptions(options, isTopLevel = true) {
        let menu = document.createElement("menu");
        let ids = [];
        for (let option of options) {
            let li = document.createElement("li");

            let item;
            if (option.type === "separator") {
                li.setAttribute("data-separator", "true");
            } else if (option.type === "button") {
                item = document.createElement("button");
                item.innerHTML = option.text;
                li.appendChild(item);

                let handler = RMenuButton.make(item);
                this.addInput(option.name, handler, option);
                handler.on('click', (target, value) => {
                    this.events.trigger('option-clicked', this, option);
                });
                handler.disabled = option.disabled == true;
            }  else if (option.type === "check" || option.type === "radio") {
                ids.push(option.name);
                let id = this.namePrefix + this.generateIndexedId(ids, option.name)
                item = document.createElement("label");
                item.innerHTML = option.text;
                item.htmlFor = id;
                li.appendChild(item);

                let ref;
                if (option.type === "check") {
                    ref = document.createElement("input");
                    ref.type = "checkbox";
                    ref.id = id;
                    ref.checked = option.checked;
                    li.appendChild(ref);
                } else if (option.type === "radio") {
                    ref = document.createElement("input");
                    ref.type = "radio";
                    ref.name = this.namePrefix + option.name;
                    ref.id = id;
                    ref.checked = option.checked;
                    li.appendChild(ref);
                }

                let handler = RMenuButton.make(item, false);
                handler.for = ref;
                handler.bind();
                this.addInput(option.name, handler, option);
                handler.on('change', (target, value) => {
                    this.events.trigger('option-clicked', this, option);
                });
                handler.disabled = option.disabled == true;
            } else {
                item = document.createElement("span");
                item.innerHTML = option.text;
                li.appendChild(item);
            }
            if (option.options) {
                li.classList.add(this.constructor.classNameHasChildren);
                li.appendChild(this.buildOptions(option.options, false));
            }
            menu.appendChild(li);
        }
        if (isTopLevel) {
            return Array.from(menu.children);
        }
        return menu;
    }

    addInput(name, handler, data) {
        this.inputs.push({
            name: name,
            handler: handler,
            data: data
        });
    }
    getInput(name) {
        let inputs = this.getInputs(name);
        return inputs.length > 0 ? inputs[0] : undefined;
    }
    getInputs(name) {
        return this.inputs.filter(inputRef => {
            return inputRef.name === name;
        });
    }

    // TODO: add a type to value, so we can transform it to the correct type, ex. number, boolean, etc.
    getOptions() {
        let data = {};
        this.inputs.forEach(inputRef => {
            if (inputRef.data.type === "check") {
                let checked = inputRef.handler.checked;
                if (checked) {
                    data[inputRef.data.name] = true;
                } else {
                    if (!data.hasOwnProperty(inputRef.data.name)) {
                        data[inputRef.data.name] = false;
                    }
                }
            } else if (inputRef.data.type === "radio") {
                let checked = inputRef.handler.checked;
                if (checked) {
                    data[inputRef.data.name] = inputRef.data.value;
                } else {
                    if (!data.hasOwnProperty(inputRef.data.name)) {
                        data[inputRef.data.name] = undefined;
                    }
                }
            }
        });
        return data;
    }
    setOption(name, value) {
        let inputs = this.getInputs(name);
        inputs.forEach(input => {
            console.log(input)
            if (input.data.type === "check") {
                input.handler.checked = value == true;
            } else if (input.data.type === "radio") {
                input.handler.checked = input.data.value === value;
            }
        });
    }
}

class RMenuButton extends RButton {
    static className = "r-menubtn";
    for = undefined;

    get checked() {
        if (this.element.tagName === "LABEL") {
            let input = this.for;
            if (input) {
                return input.checked == true;
            }
            return undefined;
        }
    }
    set checked(value) {
        if (this.element.tagName === "LABEL") {
            let input = this.for;
            if (input) {
                input.checked = value == true;
            }
        }
    }

    bind() {
        super.bind();
        if (this.element.tagName === "LABEL") {
            let input = this.for;
            if (input) {
                input.addEventListener("change", () => {
                    let value = input.checked == true;
                    this.events.trigger('change', this, value);
                });
            }
        }
    }
}