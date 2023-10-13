const project = 'DFAREGEX';

export default class Local {
    static get = (item, def) => {
        const value = localStorage.getItem(`${project}${item}`);
        
        if(value === null) return def || null;
        
        let parsed;

        try { parsed = JSON.parse(value) }
        catch{ parsed = value }

        return parsed;
    }

    static set = (item, value) => {
        try {
            if(typeof value !== 'string') value = JSON.stringify(value)
            localStorage.setItem(`${project}${item}`, value);
        }catch(e){
            alert(`Session Storage Error: ${e}`);
        }
    }

    static has = item => this.get(item) !== null;

    static remove = item => localStorage.removeItem(item);
}