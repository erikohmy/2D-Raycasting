class World {
    planes = [];
    constructor() {}

    addPlane(plane) {
        this.planes.push(plane);
    }
    removePlane(plane) {
        this.planes.splice(this.planes.indexOf(plane),1);
    }
}