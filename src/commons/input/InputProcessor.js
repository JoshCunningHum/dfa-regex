import { InputProcessorKeyboardEvent, InputProcessorMouseEvent } from "./InputProcessorEvent";

//#region baseclass
class EventEmitter{

    constructor(){
        /**
         * @protected
         */
        this.__evs__ = {};
        this.__any__ = [];
    }
    
    has(event){
        return this.__evs__[event] !== undefined;
    }
    
    on(event, cb){
        this.__evs__[event] = this.__evs__[event] || [];
        this.__evs__[event].push(cb);
    }

    onAny(cb){
        this.__any__.push(cb);
    }

    off(event, cb){
        if(!this.has(event)) return;
        // Added a check where even if two functions don't belong to the same part in the memory, as long as they do the same thing, they will be removed
        const i = this.__evs__[event].findIndex(ev => ev === cb || ev.toString() === cb.toString());
        if(i === -1) return;
        this.__evs__[event].splice(i, 1);
    }

    emit(event, ...args){
        this.__any__.forEach(ev => ev(event, ...args));
        if(!this.has(event)) return;
        this.__evs__[event].forEach(ev => ev(...args));
    }

    renameEvent(oldEvent, newEvent){
        if(!this.has(oldEvent)) return;
        if(newEvent === oldEvent) return;
        this.oldEvent = this.newEvent;
        delete this.oldEvent;
    }
}
//#endregion


/**
 * @callback InputProcessorEventCallback
 * @param {(InputProcessorKeyboardEvent | InputProcessorMouseEvent)} ev
 */

/**
 * @typedef {Ojbect} BuildInFunctionFormat
 * @property {String} event
 * @property {Function} fn
 */

/**
 * @typedef KeyboardEventType
 * @property {string} keydown
 * @property {string} keyup
 */

/**
 * @typedef MouseEventType
 * @property {string} mousemove
 * @property {string} click
 * @property {string} auxclick
 * @property {string} dblclick
 * @property {string} contextmenu
 * @property {string} mousedown
 * @property {string} mouseup
 * @property {string} mouseenter
 * @property {string} mouseover
 * @property {string} mouseleave
 * @property {string} mouseout
 * @property {string} drag
 * @property {string} dragstart
 * @property {string} dragend
 */

class InputProcessorConfig {
    /**
     * @type {HTMLElement}
     */
    monitor;
    /**Determines wether capture KeyEvents is enabled. */
    captureKey = true;
    /**Determines wether the MouseInputModule is used */
    captureMouse = false;
    
    // Future Options --- Not yet implemented
    string; // prevent defaults and other stuff
}

class InputProcessor extends EventEmitter{
    
    /**
     * Recognizes keycodes to be used as property in instances. Used in tandem with check().
     * 
     * Can also accept basic keys to be converted into property in instances of this class. (e.g. a -> KEY_A, + -> NUM_ADD)
     * 
     * @param {String} key the key property of a KeyBoard Event
     * @param {String} code the code property of a KeyBoard Event
     * @returns {String} the appropriate property of this InputProcessor instance
     */
    static recognize(key, code){
        const capKey = key.toUpperCase();

        // If this came from an HTML Keyboard Event
        if(code){
            // If an alphabet key
            if(code.match((/key(?!_)/igm))) return code.replace(/key/igm, "KEY_");
            // If a numpad key
            if(code.match(/numpad(?!_)/igm)) return code.replace(/numpad/igm, "NUM_");
            // if a digit key
            if(code.match(/digit(?!_)/igm)) return code.replace(/digit/igm, "DIG_");
        }


        // TODO: Create a more concise processing of exceptions
        // Sing Characters, usually uses outside the KeyBoard Event
        if(capKey.length === 1){
            const charCode = capKey.charCodeAt(0);
            if(65 <= charCode && 90 >= charCode) return `KEY_${capKey}`;
            if(48 <= charCode && 57 >= charCode) return `NUM_${capKey}`;
            switch(capKey){
                case '+':
                    return "NUM_ADD";
                case '-':
                    return 'NUM_SUB';
                case '*':
                    return 'NUM_MUL';
                case '/':
                    return 'SLASH_FORWARD';
                case '\\':
                    return 'SLASH_BACKWARD';
                case ' ':
                    return 'SPACE';
            }
        }
        
        return capKey;
    }

    /**
     * Serializes combinational keys (if ever it has modifier keys) for a more consistent event type on emitting and listening events.
     * @param {String[] | String} keys 
     */
    static serialize(keys){
        if(!Array.isArray(keys) && typeof keys === 'string'){
            // Split by the plus sign, if there's a two consecutive plus signs, only split the first occurent (results from CTRL and '+' making CTRL++)
            keys = this.split(keys);
        }
        keys.sort(); // Sort before anything else

        // Find any Non-Modifier Key (if any) and put it on the last
        const nonModifierIndex = keys.findIndex(k => !this.MODIFIERS.includes(k));
        if(nonModifierIndex !== -1) keys.push(keys.splice(nonModifierIndex, 1)[0]); 
        
        return keys.map(k => this.recognize(k, '')).join(this.seperator);
    }

    static get MODIFIERS(){
        return ["ALT", "CONTROL", "SHIFT"];
    }

    static seperator = '§';
    static splitter = /\+(?<=[^+].)/igm;

    static split(keys){
        return keys.split(this.splitter).join(this.seperator).split(this.seperator);
    }
    
    //#region --- KEY STATES ---
    
    // Directional keys
    ARROW_UP = false;
    ARROW_DOWN = false;
    ARROW_LEFT = false;
    ARROW_RIGHT = false;

    // Alphabet Keys: --- Initialized in the constructor
    // Numpad Keys: --- Initialized in the constructor
    // Digital Keys: --- Initialized in the constructor

    // Modifier Keys
    CONTROL = false;
    SHIFT = false;
    ALT = false;

    // Miscellaneous Keys
    SPACE = false;
    TAB = false;
    
    //#endregion

    //#region --- MOUSE STATES ---

    cursor = new MouseInputModule(this);
    
    //#endregion

    /**
     * 
     * @param {HTMLElement} element the element to monitor inputs
     * @param {InputProcessorConfig} config
     */
    constructor(element, config){
        super();

        // Set Alphabet keys
        for(let c = 0; c < 26; c++){
            this[`KEY_${String.fromCharCode(65 + c)}`] = false;
        }
        // Set Digital and Numpad Keys
        for(let n = 0; n < 10; n++){
            this[`NUM_${n}`] = false; // Numpad (Right Side of Keyboard)
            this[`DIG_${n}`] = false; // Digital (Above the alphabet keys)
        }

        this.config = config || new InputProcessorConfig();

        if(element) this.monitor = element;
    }

    /**
     * @type {InputProcessorConfig}
     */
    config;

    get monitor(){
        return this.config.monitor;
    }

    set monitor(el){
        // Remove listeners from the previous monitored element
        if(this.monitor){
            this.__built_listeners__.forEach(bl => this.monitor.removeEventListener(bl.event, bl.fn));
        }
            
        if(el === undefined || el === null){
            console.warn(`Element set to monitor is undefined`);
            return;
        }else if(this.config.captureMouse) this.cursor.monitor = el;
        if(el.tagName === 'CANVAS') el.tabIndex = 1;

        if(this.config.captureKey) this.__built_listeners__.forEach(bl => el.addEventListener(bl.event, bl.fn.bind(this)));
        this.config.monitor = el;
    }

    /**
     * @type {BuildInFunctionFormat[]}
     */
    get __built_listeners__(){
        return [
            this.__onKeyDown, 
            this.__onKeyUp,
            this.__onFocusOut
        ].map(fn => {
            return {
                // Formats the name to something that can be applied on html events
                event: fn.name.replace('__on', '').toLowerCase(),
                fn: fn
            } 
        })
    }

    /**
     * TODO: Make this more secure. Prepare a comprehensive list of actual keyboard and mouse codes
     * @type {Array<[String, Boolean]>}
     */
    get states(){
        return Object.entries(this).filter(v => typeof v[1] === 'boolean');
    }


    check(key){
        if(key === '+') key = [key];
        const keys = Array.isArray(key) ? key : typeof key === 'string' ? InputProcessor.split(key) : key;
        return keys.every(k => this[InputProcessor.recognize(k, "")]);
    }

    /**
     * 
     * @param {String[]} keys Key properties in clockwise order (e.g. up, right, down, left)
     * @returns 
     */
    direction(keys = ['ARROW_UP', 'ARROW_RIGHT', 'ARROW_DOWN', 'ARROW_LEFT']){
        if(keys.length !== 4) throw new Error(`Directional Key Array length must be exactly 4`);

        const u = this.check(keys[0]),
              d = this.check(keys[2]),
              l = this.check(keys[3]),
              r = this.check(keys[1]);

        const x = !l && !r ? 0 : !l && r ? 1 : -1,
              y = !u && !d ? 0 : !u && d ? 1 : -1;

        return [x, y];
    }

    reset(){
        // Make all boolean true property false
        Object.entries(([k, v]) => {
            if(v === true) this[k] = false;
        });
    }

    focus(){
        this.monitor.focus();
    }

    /**
     * Override the on and off event for any combinational hotkeys
     * @param {(keyof KeyboardEventType | keyof MouseEventType | Array)} event A key or key combination. Put a '+' for added modifiers, order does not matter. e.g. SHIFT+CTRL+C is equal to CTRL+SHIFT+C. CTRL and CONTROL are the same however, the InputProcessorEvent uses CONTROL.
     * @param {InputProcessorEventCallback} cb 
     * @param {Boolean} release Set to true if the callback is only invoked when releasing the said key
     */
    on(event, cb, release = false){
        if(event === '') return;
        switch(event){
            case 'keydown':
            case 'keyup':
                break;
            // Mouse events starts here
            case 'mousemove':
            case 'click': 
            case 'auxclick':
            case 'dblclick':
            case 'contextmenu':
            case 'mousedown':
            case 'mouseup':
            case 'mouseenter':
            case 'mouseover':
            case 'mouseleave':
            case 'mouseout':
            case 'dragstart':
            case 'dragend':
            case 'drag':
                break;
            default:
                event = event.replace('CTRL', 'CONTROL');
                event = InputProcessor.serialize(event);
        }
        // Modify event to properly recognize if its a release event
        if(release) event = `UP:${event}`;
        super.on(event, cb);
    }

    /**
     * Override the on and off event for any combinational hotkeys
     * @param {(keyof KeyboardEventType | keyof MouseEventType | Array)} event A key or key combination
     * @param {InputProcessorEventCallback} cb 
     * @param {Boolean} release Set to true if the callback is only invoked when releasing the said key
     */
    off(event, cb, release = false){
        if(event === '') return;
        switch(event){
            case 'keydown':
            case 'keyup':
                break;
            // Mouse events starts here
            case 'mousemove':
            case 'click': 
            case 'auxclick':
            case 'dblclick':
            case 'contextmenu':
            case 'mousedown':
            case 'mouseup':
            case 'mouseenter':
            case 'mouseover':
            case 'mouseleave':
            case 'mouseout':
            case 'dragstart':
            case 'dragend':
            case 'drag':
                break;
            default:
                event = event.replace('CTRL', 'CONTROL');
                event = InputProcessor.serialize(event);
        }
        // Modify event to properly recognize if its a release event
        if(release) event = `UP:${event}`;
        super.off(event, cb);
    }

    /**
     * @private
     * @param {KeyboardEvent} e 
     * @returns 
     */
    _processKeyBoardEvent(e){

        const key = e.key.replace(/ARROW/gi, "ARROW_");

        // Modifier Key States
        this.ALT = e.altKey;
        this.CONTROL = e.ctrlKey;
        this.SHIFT = e.shiftKey;
        
        const keyprop = InputProcessor.recognize(key, e.code);
        const active_keys = [key.toUpperCase()];
        if(this.ALT && keyprop !== 'ALT') active_keys.unshift('ALT');
        if(this.CONTROL && keyprop !== 'CONTROL') active_keys.unshift('CONTROL');
        if(this.SHIFT && keyprop !== 'SHIFT') active_keys.unshift('SHIFT');

        // Modified KeyboardEvent
        const combined = InputProcessor.serialize(active_keys);
        const ipev = new InputProcessorKeyboardEvent(e, combined, this);

        return {
            keyprop,
            combined,
            ipev,
        }
    }

    //#region --- PreBuilt Listeners ---

    /**
     * 
     * @param {KeyboardEvent} e 
     */
    __onKeyDown(e){
        e.preventDefault();

        const {keyprop, combined, ipev} = this._processKeyBoardEvent(e);
        this[keyprop] = true;

        // Emit Hotkey listeners (If not on repeat)
        if(!e.repeat) this.emit(combined, ipev);
        // Emit Also the simple/not-combined listener
        if(!e.repeat && combined !== keyprop) this.emit(keyprop, ipev);
        // Emit basic onkeydown (if any)
        this.emit(`keydown`, ipev);
    }

    /**
     * 
     * @param {KeyboardEvent} e 
     */
    __onKeyUp(e){
        e.preventDefault();
        
        const {keyprop, combined, ipev} = this._processKeyBoardEvent(e);
        this[keyprop] = false;

        // Emit hotkey listeners for release type
        this.emit(`UP:${combined}`, ipev);
        // Emit Also the simple/not-combined listener
        if(combined !== keyprop) this.emit(`UP:${keyprop}`, ipev);
        // Emit basic onkeyup (if any)
        this.emit(`keyup`, ipev);

    }
    __onFocusOut(){
        // Emit all keyup emitters if a key state is true
        Object.entries(([k, v]) => {
            if(typeof this[k] === "boolean" && v){
                this.emit(`UP:${k}`);
            }
        })
    }

    //#endregion
}

class Coordinate{
    /**
     * @type {Number}
     */
    x;
    /**
     * @type {Number}
     */
    y;

    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    /**
     * 
     * @param {Coordinate} coord 
     * @returns {Coordinate}
     */
    difference(coord){
        return new Coordinate(
            this.x - coord.x,
            this.y - coord.y
        )
    }

    sum(coord){
        return new Coordinate(
            this.x + coord.x,
            this.y + coord.y
        )
    }

    /**@type {Coordinate} */
    get clone(){
        return new Coordinate(this.x, this.y);
    }

    /**
     * Returns the array form of the coordinate
     * @type {Number[]}
     */
    get arr(){
        return [this.x, this.y];
    }
}

class MouseInputModule{
    client = new Coordinate(0, 0);
    screen = new Coordinate(0, 0);
    /**
     * The coordinate when the dragging starts. Can be used to determine the change of coordinate from the first drag starts and to the current.
     * @type {Coordinate}
     */
    lastClick;

    /**
     * @type {HTMLElement}
     */
    _monitor;

    isDragging = false;

    get monitor(){
        return this._monitor;
    }

    set monitor(el){
        if(this.monitor){
            this.__built_listeners__.forEach(bl => this.monitor.removeEventListener(bl.event, bl.fn));
        }
            
        this.__built_listeners__.forEach(bl => el.addEventListener(bl.event, bl.fn.bind(this)));
        this._monitor = el;
    }

    get __built_listeners__(){
        return [
            this.__onClick,
            this.__onAuxClick,
            this.__onDblClick,
            this.__onContextMenu,
            this.__onMouseDown,
            this.__onMouseUp,
            this.__onMouseEnter,
            this.__onMouseOver,
            this.__onMouseLeave,
            this.__onMouseOut,
            this.__onMouseMove,
            this.__onFocusOut
        ].map(fn => {
            return {
                event: fn.name.replace('__on', '').toLowerCase(),
                fn: fn
            }
        })
    }

    /**
     * @type {InputProcessor}
     */
    _ip;

    /**
     * 
     * @param {InputProcessor} processor 
     */
    constructor(processor){
        this._ip = processor;
    }

    /**
     * 
     * @param {keyof MouseEventType} event 
     * @param  {...any} args 
     */
    emit(event, ...args){
        this._ip.emit(event, ...args);
    }

    /**@param {MouseEvent} e*/
    __processMouseEvent__(e){
        const rect = this.monitor.getBoundingClientRect();

        this.screen.x = e.screenX;
        this.screen.y = e.screenY;
        this.client.x = e.clientX - rect.left;
        this.client.y = e.clientY - rect.top;

        if(e.type === 'mousedown') this.lastClick = this.client.clone;

        const ipmouse = new InputProcessorMouseEvent(this);

        return ipmouse;
    }

    //#region Built In Listeners

    /**@param {MouseEvent} e*/
    __onMouseMove(e){
        const ipmouse = this.__processMouseEvent__(e);

        if(this.isDragging) this.emit('drag', ipmouse);

        this.emit('mousemove', ipmouse);
    }

    //

    /**@param {MouseEvent} e*/
    __onClick(e){
        const ipmouse = this.__processMouseEvent__(e);

        this.emit('click', ipmouse);
    }

    /**@param {MouseEvent} e*/
    __onAuxClick(e){
        const ipmouse = this.__processMouseEvent__(e);

        this.emit('auxclick', ipmouse);
    }

    /**@param {MouseEvent} e*/
    __onDblClick(e){
        const ipmouse = this.__processMouseEvent__(e);

        this.emit('dblclick', ipmouse);
    }

    /**@param {MouseEvent} e*/
    __onContextMenu(e){
        const ipmouse = this.__processMouseEvent__(e);

        this.emit('contextmenu', ipmouse);
    }

    //

    /**@param {MouseEvent} e*/
    __onMouseDown(e){
        this.isDragging = true;
        const ipmouse = this.__processMouseEvent__(e);
        this.emit('dragstart', ipmouse);
        this.emit('mousedown', ipmouse);
    }

    /**@param {MouseEvent} e*/
    __onMouseUp(e){
        this.isDragging = false;
        this.lastClick = null;
        const ipmouse = this.__processMouseEvent__(e);
        this.emit('dragend', ipmouse);
        this.emit('mouseup', ipmouse);
    }

    //

    /**@param {MouseEvent} e*/
    __onMouseOver(e){
        const ipmouse = this.__processMouseEvent__(e);

        this.emit('mouseover', ipmouse);
    }

    /**@param {MouseEvent} e*/
    __onMouseEnter(e){
        const ipmouse = this.__processMouseEvent__(e);
        if(this.isDragging && e.buttons === 0){
            this.isDragging = false;
            this.lastClick = null;
        }
        this.emit('mouseenter', ipmouse);
    }

    /**@param {MouseEvent} e*/
    __onMouseOut(e){
        const ipmouse = this.__processMouseEvent__(e);

        this.emit('mouseout', ipmouse);
    }

    /**@param {MouseEvent} e*/
    __onMouseLeave(e){
        const ipmouse = this.__processMouseEvent__(e);

        this.emit('mouseleave', ipmouse);
    }

    __onFocusOut(){
        this.isDragging = false;
        this.lastClick = null;
    }
}

export {
    InputProcessor,
    MouseInputModule
}