class Plane {
    _p1;
    _p2;
    color;
    _texture;

    isOpaque = false;
    isTextured = false;
    isMirror = false;

    static randomColors = [
        "#FF0000",
        "#00FF00",
        "#0000FF",
        "#FFFF00",
        "#FF00FF",
        "#00FFFF",
    ];   

    // automatically calculate
    cachedOrigin;
    cachedNormal;
    cachedLength;

    constructor(x1,y1,x2,y2, color = undefined) {
        this.p1 = new Vector2D(x1,y1);
        this.p2 = new Vector2D(x2,y2);
        this.color = color ? color : Plane.getRandomColor();

        // here, have special "dynamc" textures, like "concrete1Dynamic"
        // when registiring a texture, supply several versions with different widths
        // then, choose the actual texture based on the length of the wall
        // oohhh, use a getter for texture!
    }

    static getRandomColor() {
        return Plane.randomColors[Math.floor(Math.random() * Plane.randomColors.length)];
    }

    clearCache() {
        this.cachedOrigin = undefined;
        this.cachedNormal = undefined;
        this.cachedLength = undefined;
    }

    get texture() {
        // somehow access textures from the engine
        // if texure is dynamic, return the correct one based on the length of the wall
        return this._texture;
    }
    set texture(value) {
        this._texture = value;
        this.isTextured = value !== undefined;
    }

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
    
    get origin() {
        if (this.cachedOrigin == undefined) {
            this.cachedOrigin = Vector2D.midPoint(this.p1,this.p2);
        }
        return this.cachedOrigin;
    }

    get normal() {
        if (this.cachedNormal == undefined) {
            this.cachedNormal = (new Vector2D(this.p2.y-this.p1.y,this.p1.x-this.p2.x)).normalize();
        }
        return this.cachedNormal;
    }

    get length() {
        if (this.cachedLength == undefined) {
            this.cachedLength = this.p1.subtract(this.p2).magnitude;
        }
        return this.cachedLength;
    }
}