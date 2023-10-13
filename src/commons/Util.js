import Victor from "victor";
import State from "./graph/State";
import Transition from "./graph/Transition";

export default class Util {
    static genString(len){
        return Math.random().toString(36).substring(2,len+2);
    }

    static deg360 = Math.PI * 2;
    static deg90 = Math.PI / 2;
    static deg2Rad = deg => Math.PI * deg / 180;
    static rad2Deg = rad => rad * 180 / Math.PI;

    /**
     *  
     * @param  {(State[]|Transition[])} states 
     * @param {Number} x 
     * @param {Number} y 
     * @returns {(State[]|Transition[])}
     */
    static FindHits(states, x, y){
        return states.filter(s => s.hits(x, y));
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Number} fx From X 
     * @param {Number} fy From Y
     * @param {Number} tx To X
     * @param {Number} ty To Y
     * @param {Number} arcAngle Arc Angle to be shown in degrees
     * @param {Boolean} cw Clockwise
     */
    static drawArcFromTwoPoints(ctx, fx, fy, tx, ty, arcAngle, cw = false){
        const f = new Victor(fx, fy),
            t = new Victor(tx, ty),
            a2 = arcAngle / 2,
            m = f.clone().mix(t, 0.5),
            l = f.distance(t);

        // Calculations
        const ti = 90 - a2, // Theta Inner
            r = l / (2 * Math.cos(this.deg2Rad(ti))); // radius

        const center = t.clone().subtract(f)
        .rotateDeg(cw ? ti : -ti) // change this according to cw
        .norm().multiplyScalar(r);

        const coa = center.clone().add(f);

        // ctx.strokeStyle = 'crimson';
        // this.line(ctx, ...f.toArray(), ...t.toArray());
        // ctx.strokeStyle = 'blue';
        // this.line(ctx, ...f.toArray(), ...coa.toArray());
        // this.line(ctx, ...coa.toArray(), ...t.toArray());

        ctx.strokeStyle = '#999';
        const sa = center.clone().invert().angle(),
            ea = sa - this.deg2Rad(arcAngle);
        
        ctx.beginPath();
        ctx.arc(...center.clone().add(f).toArray(), r, sa, ea, !cw);
        ctx.stroke();
        ctx.closePath();

        const ctd = center.clone().invert().rotateDeg(-a2);
        const ct = ctd.clone().add(ctd.norm().multiplyScalar(15)).add(coa);

        // ctx.strokeStyle = 'green';
        // this.line(ctx, ...coa.toArray(), ...ct.toArray());

        return {
            start: sa,
            end: ea,
            center: ct
        }
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Number} fx 
     * @param {Number} fy 
     * @param {Number} tx 
     * @param {Number} ty 
     */
    static line(ctx, fx, fy, tx, ty){
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.closePath();
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Number} x 
     * @param {Number} y 
     * @param {(Number|Victor)} angle 
     * @param {Boolean} goIn 
     */
    static drawArrow(ctx, x, y, angle, arrowAngle = 25, arrowSize = 25, goIn = true){
        const o = new Victor(x, y),
            a = angle instanceof Victor ? 
            angle.clone().norm() : 
            new Victor(1, 0).rotateDeg(angle);

        ctx.beginPath();

        a.rotateDeg(180 - arrowAngle / 2).multiplyScalar(arrowSize);
        ctx.moveTo(...o.toArray());
        ctx.lineTo(...o.clone().add(a).toArray());
        a.rotateDeg(arrowAngle);
        ctx.lineTo(...o.clone().add(a).toArray());
        ctx.lineTo(...o.toArray());
        ctx.fill();

        ctx.closePath();
    }

    static copyToClipboard = text => {
        // I thought I have to do the input trick
        navigator.clipboard.writeText(text);
    }
}