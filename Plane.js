class Plane {
    _p1;
    _p2;

    options;

    // automatically calculate
    cachedOrigin;
    cachedNormal;
    cachedLength;

    constructor(x1,y1,x2,y2, options = {}) {
        let optionsDefault = {
            color: undefined,
            editorColor: undefined,
            opaque: true,
            opacity: 1,
            mirror: false,
            texture: undefined,
        }

        this.p1 = new Vector2D(x1,y1);
        this.p2 = new Vector2D(x2,y2);
        
        this.options = Object.assign(optionsDefault, options);

        // here, have special "dynamc" textures, like "concrete1Dynamic"
        // when registiring a texture, supply several versions with different widths
        // then, choose the actual texture based on the length of the wall
        // oohhh, use a getter for texture!
    }

    clearCache() {
        this.cachedOrigin = undefined;
        this.cachedNormal = undefined;
        this.cachedLength = undefined;
    }

    /////////////////////////////
    // SETTERS AND GETTERS
    /////////////////////////////

    // texture
    get texture() {
        // somehow access textures from the engine
        // if texure is dynamic, return the correct one based on the length of the wall
        return this.options.texture;
    }
    set texture(value) {
        this.options.texture = value;
    }
    get isTextured() {
        return this.options.texture !== undefined;
    }

    // opaque
    get opaque() {
        return this.options.opaque;
    }
    set opaque(value) {
        this.options.opaque = value;
    }

    // opacity
    get opacity() {
        return this.options.opacity;
    }
    set opacity(value) {
        this.options.opacity = value;
    }

    // mirror
    get mirror() {
        return this.options.mirror;
    }
    set mirror(value) {
        this.options.mirror = value;
    }

    // color
    get color() {
        if (this.options.color) {
            return this.options.color;
        }
        if (this.mirror) {
            return "#0099ff44";
        }
        return "#f00"
    }
    set color(value) {
        this.options.color = value;
    }

    // editorColor
    get editorColor() {
        if (this.options.editorColor) {
            return this.options.editorColor;
        }
        if (this.mirror) {
            return "#0099ff";
        }
        return "#000"
    }
    set editorColor(value) {
        this.options.editorColor = value;
    }

    // p1
    get p1() {
        return this._p1;
    }
    set p1(value) {
        this._p1 = value;

        this._p1.onChange(() => {
            this.clearCache();
        })
        this.clearCache();
    }

    // p2
    get p2() {
        return this._p2;
    }
    set p2(value) { 
        this._p2 = value;

        this._p2.onChange(() => {
            this.clearCache();
        })
        this.clearCache();
    }
    
    // origin - cahced
    get origin() {
        if (this.cachedOrigin == undefined) {
            this.cachedOrigin = Vector2D.midPoint(this.p1,this.p2);
        }
        return this.cachedOrigin;
    }

    // normal - cached
    get normal() {
        if (this.cachedNormal == undefined) {
            this.cachedNormal = (new Vector2D(this.p2.y-this.p1.y,this.p1.x-this.p2.x)).normalize();
        }
        return this.cachedNormal;
    }

    // length - cached
    get length() {
        if (this.cachedLength == undefined) {
            this.cachedLength = this.p1.subtract(this.p2).magnitude;
        }
        return this.cachedLength;
    }

    /////////////////////////////
    // METHODS
    /////////////////////////////

    /**
     * Copies the plane into a new object
     * @returns {Plane} a copy of this plane
     */
    copy() {
        return new Plane(this.p1.x,this.p1.y,this.p2.x,this.p2.y,this.options);
    }
}