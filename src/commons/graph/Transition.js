import Victor from "victor";
import State from "./State";
import { useTransitionStore } from "@/stores/transitionStore";
import Util from "../Util";

export default class Transition{
    /**@type {State} */
    from;
    /**@type {State} */
    to;
    /**@type {String[]} */
    v = [];

    /**
     * 
     * @param {State} from 
     * @param {State} to 
     * @param {String[]} v
     */
    constructor(from, to, ...v){
        this.from = from;
        this.to = to;
        this.v = v.sort();
    }
    

    equalWith(from, to){
        return this.from.label === from && this.to.label === to;
    }

    /**
     * @param {Transition} other 
     * @returns {Boolean}
     */
    equals(other){
        return other.from.label === this.from.label && other.to.label === this.to.label;
    }

    addValue(...v){
        this.v.push(...v.sort());
    }

    removeValue(v){
        const i = this.v.findIndex(a => a === v);
        if(i === -1) return;
        this.v.splice(i, 1);

        if(this.v.length > 0) return;
        // If no labels left, then delete the transition
        const transitionStore = useTransitionStore();
        transitionStore.removeTransition(this.from.label, this.to.label);
    }

    str(){
        return this.v.map(v => `${this.from.label}:${v}>${this.to.label}`).join('\n');
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx){
        const vdir = this.to.pos.clone().
        subtract(this.from.pos);

        const vnorm = vdir.clone().norm();

        const v = vnorm.clone().multiplyScalar(this.from.options.radius);
        
        let end = this.to.pos.clone().subtract(v),
            start = this.from.pos.clone().add(v);

        const transitionStore = useTransitionStore();

        let textPos = null;

        // Line
        ctx.strokeStyle = '#999';

        // Text
        ctx.textAlign = 'center';
        const tw = ctx.measureText(this.v.join(', ')).width;

        ctx.fillStyle = '#999';

        let arrowSize = 20;

        if(transitionStore.getTransitionIndex(this.to.label, this.from.label) === -1){
            ctx.beginPath();
            ctx.moveTo(...start.toArray());
            ctx.lineTo(...end.clone().subtract(v).toArray());
            ctx.stroke();
            ctx.closePath();

            vnorm.invert();

            textPos = this.from.pos.clone().mix(this.to.pos, 0.5)
            .add(vdir.clone().rotateDeg(-90)
            .norm().multiplyScalar(tw)).toArray();

        }else if(this.from.label === this.to.label){
            // For self referencing
            const arcCoverage = 90;

            const arcLoc = 0, 
                tmp = new Victor(0, -(this.from.options.radius + 5));

            end = this.from.pos.clone().add(tmp.clone().rotateDeg(arcLoc));

            const { end: ea } = Util.drawArcFromTwoPoints(ctx,
                ...this.from.pos.clone().add(tmp.clone().rotateDeg(arcLoc + arcCoverage)).toArray(),
                ...end.toArray(),
                270);
            
            arrowSize = 10;

            vnorm.copy(ea);

            textPos = this.from.pos.clone().add(tmp.clone().multiplyScalar(2.8)).toArray();
        }else {
            
            const maxArc = 150, minArc = 15,
                arc = maxArc**2 / this.from.pos.distanceSq(this.to.pos);
                

            const { start: sa, end: ea, center: c } = Util.drawArcFromTwoPoints(ctx, ...start.toArray(), ...end.toArray(), 
                arc > 1 ? maxArc : maxArc * arc < minArc ? minArc : maxArc * arc
            )
            vnorm.copy(ea);

            textPos = c.toArray();
        }

        // Arrow
        const arrowAngle = 20;
        Util.drawArrow(ctx, ...end.toArray(), vnorm, arrowAngle, arrowSize);

        ctx.fillText(
            this.v.join(', '), 
        ...textPos
        );
    }
}