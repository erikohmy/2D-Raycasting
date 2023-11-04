class RaycastDisplay {
    engine;
    canvas;
    ctx;
    size;
    sliceheight;
    frames = 0;
    fps = 0;

    mousePos = {
        rx: 0,
        ry: 0,
        x: 0,
        y: 0
    };

    selectedTarget = undefined;

    selectNonsolid = false;
    selectHovered = false;
    drawSelected = false;
    drawCursor = false;

    constructor(engine, width, height) {
        this.engine = engine;
        this.canvas = document.createElement("canvas");

        this.canvas.height = height;
        this.canvas.width = width;

        this.ctx = this.canvas.getContext("2d")
		this.ctx.imageSmoothingEnabled = false;
        this.ctx.textRendering = "geometricPrecision";

        this.canvas.classList.add("raycast-display");

        this.size = {
            width: width,
            height: height
        }

        this.sliceheight = height/3;

        // focus on the engine canvas when the raycast display is clicked
        this.canvas.addEventListener("click", event => {
            this.engine.canvas.focus();
        });

        let handleMouse = (event) => {
            let bounds = this.canvas.getBoundingClientRect();
            [this.mousePos.rx, this.mousePos.ry] = [event.x - bounds.x, event.y - bounds.y];

            let actual_canvas_width = this.canvas.clientWidth;
            let xpercent = this.mousePos.rx / actual_canvas_width;
            this.mousePos.x = xpercent * this.size.width;

            let actual_canvas_height = this.canvas.clientHeight;
            let ypercent = this.mousePos.ry / actual_canvas_height;
            this.mousePos.y = ypercent * this.size.height;
        };
        document.addEventListener("mousemove", handleMouse);
        document.addEventListener("mousedown", handleMouse);
        document.addEventListener("mouseup", handleMouse);

        setInterval(() => {
            this.fps = this.frames;
            this.frames = 0;
        }, 1000);
    }

    clearScreen() {
        this.ctx.clearRect(0,0,this.size.width,this.size.height);
    }
    setcolor(color) {
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
    }

    fillRect(x,y,w,h) {
        this.ctx.fillRect(x,y,w,h);
    }

    drawText(text,x,y, size = 12, align = "center") {
        if (!text) return;
        this.ctx.font = "bold " + size + "px sans-serif";
        this.ctx.textAlign = align;
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(text, x, y);
    }

    drawImageSlice(img,sx,sy,sw,sh,x,y,w,h) {
        sx = Math.floor(sx);
        sy = Math.floor(sy);
        this.ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
    }

    getMouseSlice(resolution) {
        let slice_width = this.size.width / resolution;
        let x = Math.min(Math.max(this.mousePos.x, 0), this.size.width);
        return Math.floor(x / slice_width);
    }

    render(slices) {
        this.clearScreen();
        let slice_width = this.size.width / slices.length;
        let slice_height = this.sliceheight;

        // fill in the floor
        this.setcolor("#444");
        this.fillRect(0,this.size.height/2,this.size.width,this.size.height/2);

        let hovered_x = this.getMouseSlice(slices.length);

        // preprocess
        this.selectedTarget = undefined;
        for(let i=0;i<slices.length;i++) {
            let slice = slices[i].toReversed();
            for(let j=0;j<slice.length;j++) {
                let hit = slice[j];
                let target = hit.target
                let slice_apparent_height = slice_height * (this.size.height/hit.distance_n);
                if (this.selectHovered && i == hovered_x) {
                    if ( this.mousePos.y > this.size.height/2 - slice_apparent_height/2 && this.mousePos.y < this.size.height/2 + slice_apparent_height/2) {
                        if (this.selectNonsolid || target.solid) {
                            this.selectedTarget = hit.target;
                        }
                    }
                }
                hit.apparent_height = slice_apparent_height;
            }
        }

        if (this.selectHovered) {
            if (this.selectedTarget) {
                this.engine.selection = {
                    type: "plane",
                    target: this.selectedTarget
                }
            } else {
                this.engine.selection = undefined;
            }
        }
        
        for(let i=0;i<slices.length;i++) {
            let slice = slices[i].toReversed();
            let slice_x = slice_width * i;
            
            for(let j=0;j<slice.length;j++) {
                let hit = slice[j];
                let target = hit.target
                let selected = this.engine.isSelected(target);

                // scale the height of the slice to the distance from the origin, newtonian perspective
                let slice_apparent_height = hit.apparent_height;
                let slice_y = (this.size.height/2) - (slice_apparent_height/2);

                this.ctx.globalAlpha = target.opacity;
                if (target.isTextured) {
                    let texture = this.engine.textures[target.texture];
                    if (!texture) {
                        texture = this.engine.textures["missing"];
                    }
                    this.drawImageSlice(texture.img, texture.width * hit.coordinate, 0, slice_width, texture.height, slice_x, slice_y, slice_width, slice_apparent_height);
                } else {
                    this.setcolor(target.color);
                    this.fillRect(slice_x,slice_y,slice_width,slice_apparent_height);
                }

                if (this.drawSelected && selected) {
                    this.ctx.globalAlpha = 0.3;
                    this.setcolor("#fff");
                    this.fillRect(slice_x,slice_y,slice_width,slice_apparent_height);

                    if (this.drawCursor && i == hovered_x) {
                        this.ctx.globalAlpha = 1;
                        this.setcolor("#000");
                        this.fillRect(slice_x, this.mousePos.y - slice_width/2, slice_width, slice_width);
                    }
                }

                this.ctx.globalAlpha = 1;
            }
        }

        // show if window is focused
        if (!engine.isFocused) {
            this.setcolor("#000000aa");
            this.fillRect( 0, 0, this.size.width, this.size.height);
            // draw text on the canvas
            this.setcolor("#fff");
            this.drawText("Click to focus", this.size.width/2, this.size.height/2);
        }

        // show fps
        this.setcolor("#fff");
        this.drawText(this.fps + " FPS", 3, 7, 8, "left");

        this.frames++;
    }
}
