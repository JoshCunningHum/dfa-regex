// eslint-disable-next-line no-unused-vars
import { InputProcessor, MouseInputModule } from "./InputProcessor";

/**
 * @typedef Coordinate
 * @property {Number} x
 * @property {Number} y
 */

class InputProcessorKeyboardEvent{
    /**
     * Contains the key along with active modifiers. Ex: SHIFT+A, CTRL+SHIFT+C.
     * 
     * Modifers follow alphabetical order. Although this is not needed when adding listeners to the input processor.
     * 
     * CTRL and CONTROL are the same when adding a listener, however, ipkey will use CONTROL.
     */
    _ipkey = "";
    /**
     * @type {InputProcessor}
     */
    ip;
    /**@type {InputProcessorMouseEvent} */
    mouse;

    get ipkey(){
        return this._ipkey.replace(InputProcessor.seperator, '+');
    }

    set ipkey(value){
        this._ipkey = value; 
    }

    /**
     * List of currently active keys (key with states true)
     */
    get activeKeys(){
        return this.ip.states.filter(v => v[1]).map(v => v[0])
    }

    get ipkeySet(){
        return new Set([
            this.altKey ? "ALT" : null,
            this.ctrlKey ? "CONTROL" : null,
            this.shiftKey ? "SHIFT" : null,
            this._ipkey.split(InputProcessor.splitter).at(-1)
        ].filter(v => v !== null))
    }

    // Native KeyboardEvent Properties
    // I can't extend this to a keyboard event since there's no such thing. However, there is a KeyboardEventInit but that requires native data straight from the browser (can't imitate that data)
    key = "";
    code = "";
    location = "";
    repeat = false;
    isComposing = false;

    altKey = false;
    ctrlKey = false;
    shiftKey = false;
    getModifierState = "";

    /**
     *  
     * @param {KeyboardEvent} ev 
     * @param {String} ipkey Input Processor Key
     * @param {InputProcessor} ip
     */
    constructor(ev, ipkey, ip){
        Object.assign(this, ev);
        this.getModifierState = ev.getModifierState;
        this._ipkey = ipkey;
        this.ip = ip;
        this.mouse = new InputProcessorMouseEvent(ip.cursor);
    }
}


class InputProcessorMouseEvent{
    /**@type {Coordinate} */
    client = {};
    /**@type {Coordinate} */
    screen = {};
    /**@type {Coordinate} */
    lastClick = {};
    /**@type {Coordinate} */
    dragDiff = {};

    isDragging = false;

    /**
     * 
     * @param {MouseInputModule} ip 
     */
    constructor(ip){
        this.client = structuredClone(ip.client);
        this.screen = structuredClone(ip.screen);
        this.lastClick = structuredClone(ip.lastClick);

        this.isDragging = ip.isDragging;

        if(!ip.isDragging) return;
        
        this.dragDiff.x = ip.client.x - ip.lastClick.x;
        this.dragDiff.y = ip.client.y - ip.lastClick.y;

    }
}

export {
    InputProcessorKeyboardEvent,
    InputProcessorMouseEvent
}