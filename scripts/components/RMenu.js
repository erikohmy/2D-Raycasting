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
                event: "action-open-world"
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
        text: "View",
        options: [
            {
                text: "Grid",
                options: [
                    {
                        type: "button",
                        text: "Custom",
                        name: "gridsize",
                        value: "custom"
                    },
                    {
                        type: "separator",
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
                    {type: "button", text: "Custom", name: "color", value: "custom"},
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
                    {type: "button", text: "Custom", name: "opacity", value: "custom"},
                    {type: "separator"},
                    {type: "radio", text: "100%", name: "opacity", value: "100", checked: true},
                    {type: "radio", text: "75%", name: "opacity", value: "75"},
                    {type: "radio", text: "50%", name: "opacity", value: "50"},
                    {type: "radio", text: "25%", name: "opacity", value: "25"},
                    {type: "radio", text: "10%", name: "opacity", value: "10"},
                    {type: "radio", text: "0%", name: "opacity", value: "0"}  
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
// interface.getInput('menuMain').generateHtml(testoptions)
class RMenu extends RComponent {
    options = [];
    namePrefix = "rmenu-";
    inputs = [];
    static className = "r-menu";
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
            }  else if (option.type === "check" || option.type === "radio") {
                ids.push(option.name);
                let id = this.namePrefix + this.generateIndexedId(ids, option.name)
                item = document.createElement("label");
                item.innerHTML = option.text;
                item.htmlFor = id;
                li.appendChild(item);

                let handler = RMenuButton.make(item);
                this.addInput(option.name, handler, option);
                handler.on('click', (target, value) => {
                    this.events.trigger('option-clicked', this, option);
                });

                if (option.type === "check") {
                    item = document.createElement("input");
                    item.type = "checkbox";
                    item.id = id;
                    item.checked = option.checked;
                    li.appendChild(item);
                } else if (option.type === "radio") {
                    item = document.createElement("input");
                    item.type = "radio";
                    item.name = this.namePrefix + option.name;
                    item.id = id;
                    item.checked = option.checked;
                    li.appendChild(item);
                }
            } else {
                item = document.createElement("span");
                item.innerHTML = option.text;
                li.appendChild(item);
            }
            if (option.options) {
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
        }).map(inputRef => {
            return inputRef.handler;
        });
    }

    // handle options through this RMenu class
    // maybe a good idea? we will see how it works
    // might have issues where the options are not updated if they are somehow supposed to change
    updateOptions() {
        // update the options to make sure checked is correct
        this.inputs.forEach(inputRef => {
            if (inputRef.data.type === "check" || inputRef.data.type === "radio") {
                let checked = inputRef.handler.checked;
            }
        });
    }
    getOptions() {
        let data = {};
        console.log(this.inputs);
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
}

class RMenuButton extends RButton {
    static className = "r-menubtn";
    get checked() {
        if (this.element.tagName === "BUTTON") {
            return this.element.classList.contains("active");
        } else if (this.element.tagName === "LABEL") {
            let id = this.element.htmlFor;
            let input = document.getElementById(id);
            if (input) {
                return input.checked;
            }
            return undefined;
        }
    }
}