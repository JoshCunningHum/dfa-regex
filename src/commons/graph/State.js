import Victor from "victor";
import Util from "../Util";

class StateOptions{
    // Put more here
    radius = 15;
    border = 2;
    borderColor = '#888';
    bg = '#444';
}

/**Constants */
const deg360 = Math.PI * 2;

export default class State{
    /**@type {Victor} */
    pos;
    /**@type {String} */
    label;
    /**@type {StateOptions} */
    options;
    isFinish = false;
    isStart = false;

    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {String} label 
     * @param {StateOptions} options 
     */
    constructor(x, y, label, options = {}){
        const defOptions = new StateOptions();
        Object.assign(defOptions, options);

        this.pos = new Victor(x, y);
        this.label = label || Util.genString(3);
        this.options = defOptions;

        Math.sq
    }

    /**
     * Checks if a coordinate is inside this state
     * @param {Number} x 
     * @param {Number} y 
     * @returns {Boolean}
     */
    hits(x, y){
        const d = this.pos.distance(new Victor(x, y));
        return this.options.radius >= d;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx){
        const { pos, options, label } = this;
        const { x, y } = pos;
        const { radius, border, borderColor, bg } = options;
        const fullWidth = radius + border;

        if(this.isFinish){
            ctx.beginPath();
            ctx.fillStyle = borderColor;
            ctx.arc(x, y, fullWidth + 6, 0, deg360);
            ctx.fill();
            ctx.closePath()
            
            ctx.beginPath();
            ctx.fillStyle = "#171717";
            ctx.arc(x, y, fullWidth + 4, 0, deg360);
            ctx.fill();
            ctx.closePath()
        }

        ctx.beginPath();
        // Fill first using the border
        ctx.fillStyle = borderColor;
        ctx.ellipse(x, y, fullWidth, fullWidth, 0, 0, deg360);
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        // Then the inner part
        ctx.fillStyle = bg;
        ctx.ellipse(x, y, radius, radius, 0, 0, deg360);
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '12px Roboto';
        ctx.fillText(label, x, y + 1);

        if(this.isStart) Util.drawArrow(ctx, x - radius, y, 0, 90);
    }
}