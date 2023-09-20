/**
 * @callback DrawableGFX
 * @param {CanvasRenderingContext2D} ctx
 */

import Util from "../Util";

export class Drawables{
    /**@type {Drawables[]} */
    static instances = [];

    /**@type {String} */
    id;
    /**@type {DrawableGFX} */
    gfx;
    /**@type {Boolean} */
    isRegistered = false;

    /**
     * 
     * @param {Drawables} d 
     */
    static register(d){
        const i = this.instances.findIndex(n => n.id === d.id);
        if(i !== -1) return;
        this.instances.push(d);
        d.isRegistered = true;
    }

    /**
     * 
     * @param {DrawableGFX} gfx 
     * @param {String} id 
     */
    constructor(gfx, id){
        this.gfx = gfx;
        this.id = id || Util.genString(8);
    }

    remove(){
        const i = Drawables.instances.findIndex(d => d.id === this.id);
        if(i === -1) return;
        Drawables.instances.splice(i, 1);
        this.isRegistered = false;
    }

    register(){
        if(this.isRegistered) return;
        Drawables.register(this);
    }

    draw(ctx){
        this.gfx(ctx);
    }
}