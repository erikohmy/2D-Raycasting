class Engine2dot5D {
    loaded = false;
    canvas;
    raycaster;
    display;
    events;
    world;
    ctx;
    size;
    gridSize = 32;
    offset;
    applyOffset = true;
    applyDragOffset = true;

    textures = {};

    mousePos = {x:0,y:0};
    mousePosPressed = {x:0,y:0};
    mouseDown = false;

    keysDown = [];

    controls = {    // default controls
        dragGrid: " ",
        toggleGrid: "g",
        toggleNormals: "n",
        increaseGridSize: "+",
        decreaseGridSize: "-",
        turnLeft: "a",
        turnRight: "d",
        moveForward: "w",
        moveBackward: "s",
    };

    selectedTool = "plane"; // plane, select

    isDraggingGrid = false;
    isAddingPlane = false;

    // helpers
    showGrid = true;
    showNormals = true;

    constructor(canvas) {
        this.canvas = canvas
        this.raycaster = new Raycaster(new Vector2D(0,0), new Vector2D(1,0), 400, 90);
        this.display = new RaycastDisplay(this, 400, 200);
        this.events = new EasyEvents()
        this.world = new World()

        this.ctx = this.canvas.getContext("2d")

        this.size = {
            width: this.canvas.offsetWidth,
            height: this.canvas.offsetHeight
        }

        this.offset = {
            x: this.size.width/2,
            y: this.size.height/2
        }

        this.canvas.width = this.size.width
        this.canvas.height = this.size.height

        // bind mouse events
        this.canvas.addEventListener("mousemove", event => {
            this.render(); // maybe bad, but its to make sure the mouse is rendered

            [this.mousePos.x, this.mousePos.y] = [event.offsetX - this.offset.x, event.offsetY - this.offset.y];
        })
        this.canvas.addEventListener("mousedown", event => {
            this.render(); // maybe bad, but its to make sure the mouse is rendered

            // important to update position where the mouse is, or bugs will happen
            [this.mousePos.x, this.mousePos.y] = [event.offsetX - this.offset.x, event.offsetY - this.offset.y];

            this.mousePosPressed = {x: this.mousePos.x, y: this.mousePos.y};
            this.events.trigger("mousedown", event);
            if (event.which == 1) {
                this.events.trigger("mouseleftdown", event);
                this.mouseDown = true;
            } else if (event.which == 2) {
                this.events.trigger("mousemiddown", event);
            } else if (event.which == 3) {
                this.events.trigger("mouserightdown", event);
            }
        });
        this.canvas.addEventListener("mouseup", event => {
            this.events.trigger("mouseup", event);
            if (event.which == 1) {
                this.events.trigger("mouseleftup", event);
                this.mouseDown = false;
            } else if (event.which == 2) {
                this.events.trigger("mousemidup", event);
            } else if (event.which == 3) {
                this.events.trigger("mouserightup", event);
            }
            
            this.render(); // maybe bad, but its to make sure the mouse is rendered
        })
        this.canvas.addEventListener("contextmenu", (event) => {
            this.events.trigger("contextmenu", event);
            event.preventDefault();
        });

        // bind keyboard events
        this.canvas.addEventListener("keydown", event => {
            let keyPressed = event.key;
            if (!this.keysDown.includes(keyPressed)) {
                this.keysDown.push(keyPressed);
                this.events.trigger("keydown", keyPressed);
            }
        });
        this.canvas.addEventListener("keyup", event => {
            let keyPressed = event.key;
            if (this.keysDown.includes(keyPressed)) {
                this.keysDown.splice(this.keysDown.indexOf(keyPressed), 1);
                this.events.trigger("keyup", keyPressed);
            }
        });

        // handle events
        this.events.on("keydown", key => {  // keydown event
            if (key == this.controls.toggleGrid) {
                this.showGrid = !this.showGrid;
            } else if (key == this.controls.toggleNormals) {
                this.showNormals = !this.showNormals;
            } else if(key == this.controls.increaseGridSize) {
                this.gridSize = this.gridSize * 2;
            } else if(key == this.controls.decreaseGridSize) {
                this.gridSize = this.gridSize / 2;
            } else if (key == this.controls.dragGrid) {
                this.canvas.classList.add("drag-key-down");
                this.isDraggingGrid = this.mouseDown;
                if (this.isDraggingGrid) {
                    this.events.trigger("draggridstart");
                }
            }

            this.render();
        });

        this.events.on("keyup", key => {  // keyup event
            if (key == this.controls.dragGrid) {
                this.canvas.classList.remove("drag-key-down");
                if (this.isDraggingGrid) {
                    this.isDraggingGrid = false;
                    this.events.trigger("draggridend");
                    // apply grid drag
                    let dragged = this.getMouseDragged();
                    this.offset.x += dragged.x;
                    this.offset.y += dragged.y;
                }
            }
        });

        this.events.on("mouseleftdown", event => {  // mouseleftdown event
            this.isDraggingGrid = this.isKeyDown(this.controls.dragGrid);
            if (this.isDraggingGrid) {
                this.events.trigger("draggridstart");
            } else {
                this.isAddingPlane = this.selectedTool == "plane";
            }
        });
        this.events.on("mouseleftup", event => {  // mouseleftup event
            if (this.isDraggingGrid) {
                this.isDraggingGrid = false;
                this.events.trigger("draggridend");
                // apply grid drag
                let dragged = this.getMouseDragged();
                this.offset.x += dragged.x;
                this.offset.y += dragged.y;
            }
            if (this.isAddingPlane) {
                this.isAddingPlane = false;
                let p1x = this.mousePosPressed.x;
                let p1y = this.mousePosPressed.y;
                let p2x = this.mousePos.x;
                let p2y = this.mousePos.y;

                [p1x, p1y] = this.snapToGrid(p1x,p1y);
                [p2x, p2y] = this.snapToGrid(p2x,p2y);

                let plane = new Plane(p1x,p1y,p2x,p2y);
                
                let color = document.getElementById("optionsColor").value;
                if (color) {
                    plane.color = color;
                }

                let texture = document.getElementById("optionsTexture").value;
                if (texture) {
                    plane.texture = texture;
                }
                if (document.getElementById("optionsIsMirror").checked) {
                    plane.isMirror = true;
                }
                this.world.addPlane(plane);
            }
        });
        this.events.on("mouserightdown", event => {
            this.isAddingPlane = false;
            let plane = this.getPlaneAtMouse();
            if (plane) {
                this.world.removePlane(plane);
            }
        });
        this.events.on("draggridstart", () => {  // draggridstart event 
            this.canvas.classList.add("dragging-grid");
        });
        this.events.on("draggridend", () => {  // draggridend event
            this.canvas.classList.remove("dragging-grid");
        });
        this.events.on("textureloaded", name => {
            console.log("loaded texture:", name);
            this.textures[name].loaded = true;

            if (Object.values(this.textures).every(t => t.loaded)) {
                this.loaded = true;
                this.render();
            }
        });
        
        this.addTexture("debug", "debug.png", "#60006a");
        this.addTexture("concrete1", "concrete1.png", "#444");
        this.addTexture("concrete_pillar", "concretePillar.png", "#444");
        this.addTexture("grate", "grate1-variant.png", "#33333300");

        // test inject display into document
        document.body.appendChild(this.display.canvas);

        let testplane = new Plane(this.gridSize*6,this.gridSize,this.gridSize*6,-this.gridSize, "#000")
        testplane.texture = "concrete1";
        this.world.addPlane(testplane);

        this.loop();
    }

    addTexture(name, src, fallback) {
        let img = new Image();
        img.onload = () => {
            this.events.trigger("textureloaded", name);
            this.textures[name].width = img.width;
            this.textures[name].height = img.height;
        }
        img.src = src;
        this.textures[name] = {
            img: img,
            loaded: false,
            fallback: fallback,
            width: 0,
            height: 0
        };
    }

    exportWorldToJSON() {
        let data = {
            planes: []
        };
        this.world.planes.forEach(plane => {
            data.planes.push({
                x1: plane.p1.x,
                y1: plane.p1.y,
                x2: plane.p2.x,
                y2: plane.p2.y,
                color: plane.color,
                texture: plane.texture,
                isMirror: plane.isMirror,
            });
        });
        return JSON.stringify(data);
    }

    importWorldFromJSON(json) {
        let data = JSON.parse(json);
        this.world.planes = [];
        data.planes.forEach(plane => {
            let newPlane = new Plane(plane.x1, plane.y1, plane.x2, plane.y2, plane.color);
            newPlane.texture = plane.texture;
            newPlane.isMirror = plane.isMirror;
            this.world.addPlane(newPlane);
        });
    }

    loop() {
        if (this.loaded) {
            //this.render(); // was laggy
            let moveForward = this.keysDown.indexOf(this.controls.moveForward) != -1
            if ( moveForward || this.keysDown.indexOf(this.controls.moveBackward) != -1 ) {
                let speed = 3;
                speed = moveForward ? speed : -speed;
                this.raycaster.position = this.raycaster.position.add(this.raycaster.facing.scale(speed));
                this.raycaster.setupRays();

                this.offset.x = this.size.width/2 - this.raycaster.position.x;
                this.offset.y = this.size.height/2 - this.raycaster.position.y;

                this.render();
            }

            let turnLeft = this.keysDown.indexOf(this.controls.turnLeft) != -1;
            let turnRight = this.keysDown.indexOf(this.controls.turnRight) != -1;
            if (turnLeft || turnRight) {
                let speed = 2;
                speed = turnRight ? speed : -speed;
                this.raycaster.facing = this.raycaster.facing.rotate(speed, 'degrees');
                this.raycaster.setupRays();
                this.render();
            }
        }

        window.requestAnimationFrame(() => {
            this.loop();
        });
    }

    getMouseDragged() {
        if (this.mouseDown) {
            return {
                x: this.mousePos.x - this.mousePosPressed.x,
                y: this.mousePos.y - this.mousePosPressed.y
            }
        }
        return {x:0,y:0}
    }

    getMouseDraggedDistance() {
        if (this.mouseDown) {
            return Math.sqrt(Math.pow(this.mousePos.x - this.mousePosPressed.x, 2) + Math.pow(this.mousePos.y - this.mousePosPressed.y, 2))
        }
        return 0;
    }

    isKeyDown(key) {
        return this.keysDown.includes(key);
    }

    // Base Graphics
    clearScreen() {
        this.ctx.clearRect(0,0,this.size.width,this.size.height);
    }
    setcolor(color) {
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
    }

    drawpixel(x,y) {
        [x,y] = this.transformCoordinates(x,y);
        this.ctx.fillRect(x,y,1,1);
    }
    drawLine(x,y,x2,y2) {
        [x,y] = this.transformCoordinates(x,y);
        [x2,y2] = this.transformCoordinates(x2,y2);
        this.ctx.beginPath();
        this.ctx.moveTo(x,y);
        this.ctx.lineTo(x2,y2);
        this.ctx.stroke();
    }
    drawRect(x,y,w,h, origin = "top-left") {
        [x,y] = this.transformCoordinates(x,y);
        this.ctx.beginPath();
        if (origin == "center") {
            x -= w/2;
            y -= h/2;
        }
        this.ctx.rect(x,y,w,h);
        this.ctx.stroke();
    }
    drawCircle(x,y,r) {
        [x,y] = this.transformCoordinates(x,y);
        this.ctx.beginPath();
        this.ctx.arc(x,y,r,0,2*Math.PI);
        this.ctx.stroke();
    }

    fillRect(x,y,w,h, origin = "top-left") {
        [x,y] = this.transformCoordinates(x,y);
        this.ctx.beginPath();
        if (origin == "center") {
            x -= w/2;
            y -= h/2;
        }
        this.ctx.rect(x,y,w,h);
        this.ctx.fill();
    }
    fillCircle(x,y,r) {
        [x,y] = this.transformCoordinates(x,y);
        this.ctx.beginPath();
        this.ctx.arc(x,y,r,0,2*Math.PI);
        this.ctx.fill();
    }

    drawImage(img,x,y,w,h) {
        this.ctx.drawImage(img,x,y,w,h);
    }
    drawImageSlice(img,sx,sy,sw,sh,x,y,w,h) {
        this.ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
    }

    //
    getOffset(withDrawOffset = true) {
        let dragged = {x:0,y:0};
        if (this.isDraggingGrid && withDrawOffset) {
            dragged = this.getMouseDragged();
        }
        return {
            x: this.offset.x + dragged.x,
            y: this.offset.y + dragged.y
        }
    }
    transformCoordinates(x,y) {
        if (this.applyOffset) {
            let offset = this.applyDragOffset ? this.getOffset() : this.getOffset(false);
            return [x + offset.x, y + offset.y]
        }
        return [x,y]
    }
    snapToGrid(x,y) {
        return [
            Math.round(x / this.gridSize) * this.gridSize,
            Math.round(y / this.gridSize) * this.gridSize
        ]
    }
    renderGrid() {
        this.applyOffset=false;
        let offset = this.getOffset();
        let offsetX = -(offset.x % this.gridSize);
        let offsetY = -(offset.y % this.gridSize);

        for (let x = -offsetX; x < this.size.width; x += this.gridSize) {
            this.drawLine(x,0,x,this.size.height)
        }
        for (let y = -offsetY; y < this.size.height; y += this.gridSize) {
            this.drawLine(0,y,this.size.width,y)
        }
        this.applyOffset=true;
    }
    renderCursor() {
        let lineLength = 10;
        this.applyDragOffset=false;
        this.drawLine( this.mousePos.x - lineLength, this.mousePos.y, this.mousePos.x + lineLength, this.mousePos.y)
        this.drawLine( this.mousePos.x, this.mousePos.y - lineLength, this.mousePos.x, this.mousePos.y + lineLength)
        this.applyDragOffset=true;
    }
    isMouseInsideRect(x,y,w,h) {
        //[x,y] = this.transformCoordinates(x,y);
        return this.mousePos.x >= x && this.mousePos.x <= x+w && this.mousePos.y >= y && this.mousePos.y <= y+h;
    }
    isMouseInsideCircle(x,y,r) {
        //[x,y] = this.transformCoordinates(x,y);
        return Math.sqrt(Math.pow(this.mousePos.x - x, 2) + Math.pow(this.mousePos.y - y, 2)) <= r;
    }
    getPlaneAtMouse() {
        let closestPlane = undefined;
        let closestDistance = undefined;
        let point = new Vector2D(this.mousePos.x, this.mousePos.y);
        let selectionDistance = 5;
        this.world.planes.forEach(plane => {
            let distance = point.distanceTo(plane.origin)
            if (closestDistance == undefined || distance < closestDistance) {
                closestPlane = plane;
                closestDistance = distance;
            }
        });
        if (typeof closestDistance === 'number' && closestDistance <= selectionDistance) {
            return closestPlane;
        }
        return null;
    }

    //
    render() {
        if (!this.loaded) {
            return false;
        }
        this.clearScreen();

        // grid and outline
        if (this.showGrid) {
            this.setcolor("#eee")
            this.renderGrid()
            this.applyOffset=false;
            this.drawRect( 0, 0, this.size.width, this.size.height)
            this.applyOffset=true;
        }

        // render planes
        this.world.planes.forEach(plane => {
            if (plane.isTextured) {
                let texture = this.textures[plane.texture];
                this.setcolor(texture.fallback);
            } else {
                this.setcolor(plane.color);
            }
            
            this.drawLine( plane.p1.x, plane.p1.y, plane.p2.x, plane.p2.y)

            if (this.showNormals) {
                this.setcolor("#d00");
                let normalEnd = plane.origin.add(plane.normal.scale(10));
                this.drawLine( plane.origin.x, plane.origin.y, normalEnd.x, normalEnd.y)
            }
        });

        // origin
        /*
        this.setcolor("#0099ff");
        this.drawCircle( 0, 0, 10)
        */
        // draw mouse
        /*
        this.setcolor("#f00");
        this.renderCursor()
        */

        // temporary test, handle for real
        if (this.isAddingPlane) {
            let p1x = this.mousePosPressed.x;
            let p1y = this.mousePosPressed.y;
            let p2x = this.mousePos.x;
            let p2y = this.mousePos.y;

            [p1x, p1y] = this.snapToGrid(p1x,p1y);
            [p2x, p2y] = this.snapToGrid(p2x,p2y);

            this.setcolor("#f00");
            this.drawLine( p1x, p1y, p2x, p2y)
            this.fillCircle( p1x, p1y, 4)
            this.fillCircle( p2x, p2y, 4)
        }

        // render the scene
        if (true) {
            let hits = this.raycaster.intersect(this.world.planes);
            this.display.render(hits);

            // render a cone for the raycaster 
            let firstRay =  this.raycaster.rays[0];
            let lastRay = this.raycaster.rays[this.raycaster.rays.length-1];
            let facingleftedge = firstRay.origin.add(firstRay.direction.scale(1000));
            let facingrightedge = lastRay.origin.add(lastRay.direction.scale(1000));
            this.setcolor("#f00");
            this.fillCircle(this.raycaster.position.x, this.raycaster.position.y, 10);
            this.drawLine( firstRay.origin.x, firstRay.origin.y, facingleftedge.x, facingleftedge.y);
            this.drawLine( lastRay.origin.x, lastRay.origin.y, facingrightedge.x, facingrightedge.y);
        }
    }
}