class Vector2D {
    _x = 0;
    _y = 0;

    _listeners = [];

    // automatically calculate
    cachedMagnitude;

    constructor(x,y) {
        this._x = x;
        this._y = y;
    }

    // events

    onChange(callback) {
        this._listeners.push(callback);
    }
    triggerChange() {
        this._listeners.forEach(l => l(this));
    }

    static midPoint(v1,v2) {
        return new Vector2D((v1.x+v2.x)/2,(v1.y+v2.y)/2);
    }

    static distance(v1,v2) {
        return Math.sqrt(Math.pow(v1.x-v2.x,2)+Math.pow(v1.y-v2.y,2));
    }

    static fromAngle(angle, type = "degrees") {
        angle = type == "degrees" ? Vector2D.d2r(angle) : angle;
        return new Vector2D(Math.cos(angle), Math.sin(angle));
    }

    static d2r(degrees) {
        return degrees * (Math.PI/180);
    }

    static r2d(angle) {
        return angle * (180/Math.PI);
    }

    get magnitude() {
        if (this.cachedMagnitude == undefined) {
            this.cachedMagnitude = Math.sqrt(this.x*this.x+this.y*this.y);
        }
        return this.cachedMagnitude;
    }
    set magnitude(value) {
        let scaled = this.normalize().scale(value);
        this.x = scaled.x;
        this.y = scaled.y;
    }

    get x() {
        return this._x;
    }
    set x(value) {
        this.cachedMagnitude = undefined;
        this._x = value;
        this.triggerChange();
    }

    get y() {
        return this._y;
    }
    set y(value) {
        this.cachedMagnitude = undefined;
        this._y = value;
        this.triggerChange();
    }

    get angle() {
        return Math.atan2(this.y, this.x);
    }

    get degrees() {
        return this.angle * (180/Math.PI);
    }

    normalize() {
        let length = this.magnitude;
        return new Vector2D(this.x/length,this.y/length);
    }

    add(vector) {
        return new Vector2D(this.x+vector.x,this.y+vector.y);
    }

    subtract(vector) {
        return new Vector2D(this.x-vector.x,this.y-vector.y);
    }

    scale(value) {
        return new Vector2D(this.x*value,this.y*value);
    }

    rotate(angle, type = "degrees") {
        if (type == "degrees") {
            angle = Vector2D.d2r(angle);
        }
        let x = this.x;
        let y = this.y;
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        return new Vector2D(x*cos-y*sin,x*sin+y*cos);
    }

    reflect(normal) {
        let n = normal.normalize();
        let d = this.normalize();
        let dot = d.dot(n);
        return d.subtract(n.scale(2*dot));
    }

    distanceTo(vector) {
        return Vector2D.distance(this,vector);
    }

    dot(vector) {
        return this.x*vector.x+this.y*vector.y;
    }

    copy() {
        return new Vector2D(this.x,this.y);
    }
}