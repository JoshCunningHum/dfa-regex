import { InputProcessor } from "../input/InputProcessor";

import { useAlphabetStore } from "@/stores/alphabetStore";
import { useTransitionStore } from "@/stores/transitionStore";
import { useStateStore } from "@/stores/stateStore";
import { useMainStore } from "@/stores/mainStore";

import State from "../graph/State";
import Util from "../Util";
import { useModeStore } from "@/stores/modeStore";
import { Drawables } from "./Drawables";
import { useMouseStore } from "@/stores/mouseStore";

const ip = new InputProcessor(null, {
    captureKey: true,
    captureMouse: true
})

/**
 * 
 * @param {HTMLElement} c 
 */
export function monitor(c){
    ip.monitor = c;
}


let HAS_INITIALIZED = false;
export function initCanvas(){
    // To be sure that this function is only run once
    if(HAS_INITIALIZED) return;
    HAS_INITIALIZED = true;

    const alphabetStore = useAlphabetStore(),
        transitionStore = useTransitionStore(),
        stateStore = useStateStore(),
        mouseStore = useMouseStore(),
        modeStore = useModeStore(),
        mainStore = useMainStore();

    const { monitor: c } = ip,
        ctx = c.getContext('2d');

    const canvas = {};

    Object.defineProperty(canvas, 'cursor', {
        get: () => c.style.cursor,
        set: v => c.style.cursor = v
    })

    // Add a state on double click
    ip.on('dblclick', ev => {
        const { x, y } = ev.client;

        // Only add states when mode is default
        if(modeStore.mode !== 'default') return;
        stateStore.addState(new State(x, y));
        // set the cursor to pointer after creating a state
        canvas.cursor = 'pointer';
    })

    ip.on('drag', ev => {
        const { x, y } = ev.dragDiff,
            selected = mainStore.selected,
            origin = mainStore.selectedOrigin;

        // Only support drag when default mode
        if(modeStore.mode !== 'default') return;

        if(selected === undefined || !(selected instanceof State)) return;

        const { x: ox, y: oy } = origin;

        // selected._isDragging = true;
        selected.pos.x = ox + x;
        selected.pos.y = oy + y;
    })

    ip.on('dragend', ev => {
        if(mainStore.selected) {
            canvas.cursor = 'pointer';
            mainStore.selected._isDragging = false;
        }
    })

    // Monitor on clicks
    ip.on('mousedown', ev => {
        const { x , y } = ev.client;

        const clicked = Util.FindHits(stateStore.states, x, y)[0];

        mainStore.select(clicked);


        if(modeStore.mode === 'linking'){
            if(clicked instanceof State){
                if(!modeStore.linkStart) modeStore.linkStart = clicked.label;
                else modeStore.linkEnd = clicked.label;
            }else modeStore.linkStart = '';
        } 
        if(clicked === undefined) return;
        if(modeStore.mode === 'delete') stateStore.removeState(clicked.label);
    })

    ip.on('mousemove', ev => {
        const { x, y } = ev.client,
            selected = mainStore.selected;

        mouseStore.set(x, y);

        const hovering = Util.FindHits(stateStore.states, x, y )[0];

        let cursor = 'default';

        // Manage cursors while moving
        switch(modeStore.mode){
            case 'default':
                // When dragging
                if(selected && ev.isDragging) cursor = 'grabbing'
                else if(hovering) cursor = 'pointer'
                break;
            case 'linking':
                if(modeStore.linkStart) cursor = 'crosshair';
                else if(hovering instanceof State) cursor = 'copy';
                break;
            case 'delete':
                if(hovering) cursor = 'crosshair';
                break;
        }


        canvas.cursor = cursor;
    })

    ip.on('mouseup', ev => {
        // When stopped dragging
    })

    // Hotkeys 
    
    window.ip = ip;

    ip.on('C', () => {
      modeStore.mode = 'linking';
    })

    ip.on('V', () => {
        modeStore.mode = 'default';
    })

    ip.on('D', () => {
        modeStore.mode = 'delete';
    })
}

export function focus(){
    ip.focus();
    ip.monitor.focus()
}

export function getMonitor(){
    return ip.monitor;
}