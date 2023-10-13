import { Drawables } from "@/commons/canvas/Drawables";
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useMouseStore } from "./mouseStore";
import State from "@/commons/graph/State";
import { useStateStore } from "./stateStore";
import Victor from "victor";
import Util from "@/commons/Util";


export const useModeStore = defineStore('mode', () => {

    //#region Stores and Drawables
    const stateStore = useStateStore();
    const mousestore = useMouseStore();
    
    const linkingArrow = new Drawables(ctx => {
        const { x, y } = mousestore;
        
        /**@type {State} */
        const start = stateStore.getState(linkStart.value);
        if(start === undefined) return;

        // Line
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#999999';
        ctx.fillStyle = '#999';
        ctx.beginPath();
        ctx.moveTo(...start.pos.toArray());
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.closePath();

        // Triangle
        const v = new Victor(x, y).subtract(start.pos).normalize().multiplyScalar(25).invert();
        Util.drawArrow(ctx, x, y, v);

        // Inner Circle
        ctx.beginPath();
        ctx.arc(...start.pos.toArray(), 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

    }, 'link-arrow');
    //#endregion

    /**@type {('default'|'linking'|'delete')} */
    const mode = ref('default');

    watch(mode, v => {
        linkReset();
        if(v === 'linking') linkingArrow.register();
        else linkingArrow.remove();
    })

    const linkStart = ref(''),
        linkEnd = ref(''),
        linkReset = () => {
            linkStart.value = '';
            linkEnd.value = '';
        }

    const openTransitionDialog = ref(false);

    watch(linkEnd, v => {
        openTransitionDialog.value = v !== '';
    })

    return {
        linkStart,
        linkEnd,
        linkReset,
        
        mode,
        openTransitionDialog
    }
})