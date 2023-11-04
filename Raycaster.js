class Raycaster {
    _position;
    _facing;
    _fov = 90;
    _resolution;

    rays = [];

    constructor(position, facing, resolution, fov = 90) {
        this.position = position;
        this.facing = facing;
        this.resolution = resolution;
        this.fov = fov;

        // temp, auto update this when anything changes
        this.setupRays();
    }

    get position() {
        return this._position;
    }
    set position(pos) {
        this._position = pos;
    }

    get facing() {
        return this._facing;
    }
    set facing(facing) {
        this._facing = facing;
    }

    get resolution() {
        return this._resolution;
    }
    set resolution(res) {
        this._resolution = res;
    }

    get fov() {
        return this._fov;
    }
    set fov(fov) {
        this._fov = fov;
    }

    setupRays() {
        this.rays = [];
        let step = this.fov / this.resolution;
        let angle = this.facing.degrees - this.fov/2;
        for(let i = 0; i < this.resolution; i++) {
            let direction = Vector2D.fromAngle(angle)
            let ray = new Ray(this.position, direction);
            this.rays.push(ray);
            angle += step;
        }
    }

    intersectOld(planes) { 
        let hits = [];
        for(let ray of this.rays) {
            let stack = [];
            for(let plane of planes) {
                let hit = ray.intersectPlane(plane);
                if (hit) {
                    //let B = Vector2D.d2r(90 - (this.facing.degrees - ray.direction.degrees) );
                    let B = 180 - (90 - (ray.direction.degrees - this.facing.degrees));
                    //let A = 180 - B - 90;
                    //hit.angle = A + " + " + B + " + " + 90 + " = " + (A + B + 90)
                    hit.distance_n = hit.distance * Math.sin(Vector2D.d2r(B));
                    stack.push(hit);
                    if (plane.isOpaque) {
                        break;
                    }
                }
            }
            // sort stack by distance
            stack.sort((a,b) => a.distance - b.distance);
            hits.push(stack);
        }
        return hits;
    }

    intersect(planes) {
        let hits = [];
        for(let ray of this.rays) {
            let stack = ray.intersectPlanes(planes);
            for(let hit of stack) {
                let B = 180 - (90 - (ray.direction.degrees - this.facing.degrees));
                hit.distance_n = hit.distance * Math.sin(Vector2D.d2r(B));
            }
            stack.sort((a,b) => a.distance - b.distance);
            hits.push(stack);
        }
        return hits;
    }
}

class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }

    line_intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
        if (denom == 0) {
            return null;
        }
        ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
        ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
        return {
            x: x1 + ua * (x2 - x1),
            y: y1 + ua * (y2 - y1),
            seg1: ua >= 0 && ua <= 1, // pointing towards plane
            seg2: ub >= 0 && ub <= 1, // passing through plane
            ua: ua,
            ub: ub
        };
    }

    intersectPlane(plane) {
        let dirScaled = this.direction.scale(100000);
        let [x1,y1,x2,y2,x3,y3,x4,y4] = [this.origin.x,this.origin.y,this.origin.x + dirScaled.x,this.origin.y + dirScaled.y,plane.p1.x,plane.p1.y,plane.p2.x,plane.p2.y];
        let intersection = this.line_intersect(x1,y1,x2,y2,x3,y3,x4,y4);
        if (intersection !== null && intersection.seg1 && intersection.seg2) {
            let point = new Vector2D(intersection.x,intersection.y)
            return {
                point: point,
                coordinate: 1 - Math.min(1, Math.max(0, intersection.ub)),
                target: plane,
                distance: this.origin.distanceTo(point)
            }
        }
        return undefined;
    }

    intersectPlanes(planes, depth = 0) {
        let rawhits = [];

        // get all intersecting planes
        for(let plane of planes) {
            let hit = this.intersectPlane(plane);
            if (hit) {
                rawhits.push(hit);
            }
        }

        // sort by distance
        rawhits.sort((a,b) => a.distance - b.distance);

        let hits = [];
        for(let hit of rawhits) {
            if (hit.target.isMirror) {
                // allow up to 16 reflections
                if(depth > 16) {
                    hits.push(hit);
                    break;
                }
                // move hit point slightly backwards to avoid self-intersection
                let ref_point = hit.point.subtract(this.direction.scale(0.001));
                let ref_ray = new Ray(ref_point, this.direction.reflect(hit.target.normal));
                let ref_hits = ref_ray.intersectPlanes(planes, depth+1);
                for(let ref_hit of ref_hits) {
                    ref_hit.distance += hit.distance;
                }
                hits.push(hit); // test
                hits = hits.concat(ref_hits);
                break;
            }
            hits.push(hit);
            if (hit.target.isOpaque) {
                break;
            }
        }

        hits.sort((a,b) => a.distance - b.distance);

        /*
        if (plane.isMirror) {
            let ref_ray = new Ray(hit.point, this.direction.reflect(hit.target.normal));
            return ref_ray.intersectPlanes(planes);
        }
        */
        return hits;
    }
}