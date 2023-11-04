class Raycaster {
    _position;
    _facing;
    _fov = 90;
    _resolution;

    constructor(position, facing, resolution, fov = 90) {
        this.position = position;
        this.facing = facing;
        this.resolution = resolution;
        this.fov = fov;
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

    intersect(planes) {
        let hits = [];
        let step = this.fov / this.resolution;
        let angle = this.facing.degrees - this.fov/2;
        let ray = new Ray(this.position, null);

        for(let i = 0; i < this.resolution; i++) {
            ray.facing = Vector2D.fromAngle(angle)
            let stack = ray.intersectPlanes(planes);
            for(let hit of stack) {
                let B = 180 - (90 - (ray.facing.degrees - this.facing.degrees));
                hit.distance_n = hit.distance * Math.sin(Vector2D.d2r(B));
            }
            stack.sort((a,b) => a.distance - b.distance);
            hits.push(stack);
            angle += step;
        }
        
        return hits;
    }
}

class Ray {
    constructor(origin, facing) {
        this.origin = origin;
        this.facing = facing;
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
        let dirScaled = this.facing.scale(100000);
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
            if (hit.target.mirror) {
                // allow up to 16 reflections
                if(depth > 16) {
                    hits.push(hit);
                    break;
                }
                // move hit point slightly backwards to avoid self-intersection
                let ref_point = hit.point.subtract(this.facing.scale(0.001));
                let ref_ray = new Ray(ref_point, this.facing.reflect(hit.target.normal));
                let ref_hits = ref_ray.intersectPlanes(planes, depth+1);
                for(let ref_hit of ref_hits) {
                    ref_hit.distance += hit.distance;
                }
                hits.push(hit); // test
                hits = hits.concat(ref_hits);
                break;
            }
            hits.push(hit);
            if (hit.target.opaque) {
                break;
            }
        }

        hits.sort((a,b) => a.distance - b.distance);

        return hits;
    }
}
