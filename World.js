class World {
    planes = [];
    constructor() {}

    createPlane(x1,y1,x2,y2,color = undefined) {
        let plane = new Plane(x1,y1,x2,y2,color);
        if ( plane.length > 0 ) {
            console.log('created wall of length', this.length)
            this.planes.push(plane);
        }
    }
    addPlane(plane) {
        this.planes.push(plane);
    }
    removePlane(plane) {
        this.planes.splice(this.planes.indexOf(plane),1);
    }
}