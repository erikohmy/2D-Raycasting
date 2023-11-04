class RaycastDisplay {
    engine;
    canvas;
    ctx;
    size;
    sliceheight;

    constructor(engine, width, height) {
        this.engine = engine;
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d")
		this.ctx.imageSmoothingEnabled = false;

        this.canvas.classList.add("raycast-display");
        this.canvas.height = height;
        this.canvas.width = width;

        this.size = {
            width: width,
            height: height
        }

        this.sliceheight = height/3;
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

    drawImageSlice(img,sx,sy,sw,sh,x,y,w,h) {
        this.ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
    }

    render(slices) {
        this.clearScreen();
        let slice_width = this.size.width / slices.length;
        let slice_height = this.sliceheight;


        // fill in the floor
        this.setcolor("#444");
        this.fillRect(0,this.size.height/2,this.size.width,this.size.height/2);

        //let debugbuffer = [];
        for(let i=0;i<slices.length;i++) {
            let slice = slices[i].toReversed();
            let slice_x = slice_width * i;
            
            for(let j=0;j<slice.length;j++) {
                let hit = slice[j];
                let target = hit.target

                //debug
                /*
                let mid = Math.floor(slices.length/2);
                if (i==0 || i==slices.length-1 || i==mid) {
                    debugbuffer.push(hit.angle)
                }
                */

                // scale the height of the slice to the distance from the origin, newtonian perspective
                let slice_apparent_height = slice_height * (this.size.height/hit.distance_n);
                let slice_y = (this.size.height/2) - (slice_apparent_height/2);

                if (target.isTextured) {
                    let texture = this.engine.textures[target.texture];
                    this.setcolor(texture.fallback);
                    this.fillRect(slice_x,slice_y,slice_width,slice_apparent_height);
                    this.drawImageSlice(texture.img, texture.width * hit.coordinate, 0, slice_width, texture.height, slice_x, slice_y, slice_width, slice_apparent_height);
                } else {
                    this.setcolor(target.color);
                    this.fillRect(slice_x,slice_y,slice_width,slice_apparent_height);
                }
            }
        }
        //console.log(debugbuffer);
    }
}
