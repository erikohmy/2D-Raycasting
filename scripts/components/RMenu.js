let testoptions = [
    {
        type: "text",
        text: "File",
        options: [
            {
                type: "button",
                text: "New",
                event: "action-reset-world"
            },
            {
                type: "button",
                text: "Open",
                event: "action-open-world"
            },
            {
                type: "button",
                text: "Download",
                event: "action-download-world"
            },
        ]
    },
    {
        type: "text",
        text: "View",
        options: [
            {
                type: "text",
                text: "Grid",
                options: [
                    {
                        type: "button",
                        text: "Custom",
                        name: "gridsize",
                    },
                    {
                        type: "separator",
                    },
                    {
                        type: "radio",
                        text: "64x64",
                        name: "gridsize",
                    },
                    {
                        type: "radio",
                        text: "32x32",
                        name: "gridsize",
                    },
                    {
                        type: "radio",
                        text: "16x16",
                        name: "gridsize",
                    },
                ]
            }
        ]
    }
];
// interface.getInput('menuMain').generateHtml(testoptions)
class RMenu extends RComponent {
    options = [];
    namePrefix = "rmenu-";
    static className = "r-menu";
    generateHtml(options) {
        if (! (options instanceof Array)) {
            options = this.options;
        }
        let menu = this.buildOptions(options);
        console.log(menu);
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
        console.log(current, count);
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
            } else if (option.type === "text") {
                item = document.createElement("span");
                item.innerHTML = option.text;
                li.appendChild(item);
            } else if (option.type === "button") {
                item = document.createElement("button");
                item.innerHTML = option.text;
                li.appendChild(item);
            }  else if (option.type === "checkbox" || option.type === "radio") {
                ids.push(option.name);
                let id = this.namePrefix + this.generateIndexedId(ids, option.name)
                item = document.createElement("label");
                item.innerHTML = option.text;
                item.htmlFor = id;
                li.appendChild(item);

                if (option.type === "checkbox") {
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
                item.innerHTML = "ERROR";
                item.style.color = "red";
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
}