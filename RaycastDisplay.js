class RaycastDisplay {
    engine;
    canvas;
    ctx;
    size;
    sliceheight;
    frames = 0;
    fps = 0;

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

    render(slices) {
        this.clearScreen();
        let slice_width = this.size.width / slices.length;
        let slice_height = this.sliceheight;


        // fill in the floor
        this.setcolor("#444");
        this.fillRect(0,this.size.height/2,this.size.width,this.size.height/2);

        for(let i=0;i<slices.length;i++) {
            let slice = slices[i].toReversed();
            let slice_x = slice_width * i;
            
            for(let j=0;j<slice.length;j++) {
                let hit = slice[j];
                let target = hit.target

                // scale the height of the slice to the distance from the origin, newtonian perspective
                let slice_apparent_height = slice_height * (this.size.height/hit.distance_n);
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
