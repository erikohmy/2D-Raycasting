class World {
    planes = [];
    constructor() {}

    addPlane(plane) {
        if(plane.p1.x == plane.p2.x && plane.p1.y == plane.p2.y) {
            return false;
        }
        this.planes.push(plane);
        // return self for chaining
        return this;
    }
    removePlane(plane) {
        this.planes.splice(this.planes.indexOf(plane),1);
    }
    getPlanesWithinBounds(x1,y1,x2,y2) {
        let planes = [];
        this.planes.forEach(plane => {
            if (plane.origin.x >= x1 && plane.origin.x <= x2 && plane.origin.y >= y1 && plane.origin.y <= y2) {
                planes.push(plane);
            }
        });
        return planes;
    }
}