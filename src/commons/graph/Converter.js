import noam from '@/plugins/noam';

class FSMTransition{
    /**@type {String} */
    fromState;
    /**@type {String} */
    symbol;
    /**@type {String[]} */
    toStates;

    constructor(from, value, ...to){
        this.fromState = from;
        this.symbol = value;
        this.toStates = to; 
    }
}

class FSMData{
    /**@type {String[]} */
    states = [];
    /**@type {String} */
    initialState;
    /**@type {String[]} */
    acceptingStates = [];
    /**@type {FSMTransition[]} */
    transitions = [];
    /**@type {String[]} */
    alphabet;
}

export class FSM {
    /**@type {FSMData} */
    data;

    get states() {
        return this.data.states;
    }

    get initial() {
        return this.data.initialState;
    }

    get accepting() {
        return this.data.acceptingStates;
    }

    get transitions() {
        return this.data.transitions;
    }

    get alphabet() {
        return this.data.alphabet;
    }

    add_t = (from, to, value) => {
        // Check if from and to exists, if not then don't add
        const fi = this.index_s(from),
            ti = this.index_s(to);

        if (fi === -1 || ti === -1) return;

        // console.log(from, to, value);

        // Check if there is already an existing transition
        const i = this.transitions.findIndex(
            (t) => t.fromState == from && t.symbol === value
        );
        const t =
            i === -1 ? new FSMTransition(from, value, to) : this.transitions[i];
        if (i !== -1) t.toStates = [...t.toStates, to];
        else this.transitions.push(t);
    };
    index_tfrom = (from) =>
        this.transitions.findIndex((t) => t.fromState === from);
    index_tto = (to) =>
        this.transitions.findIndex((t) => t.toStates.includes(to));
    remove_tfrom = (from) => {
        let n;
        while (n !== -1) {
            n = this.index_tfrom(from);
            if (n === -1) break;
            this.transitions.splice(n, 1);
        }
    };
    remove_tto = (to) => {
        let n;
        while (n !== -1) {
            n = this.index_tto(to);
            if (n == -1) break;
            const t = this.transitions[n];
            if (t.toStates.length === 1) this.transitions.splice(n, 1);
            else t.toStates.splice(t.toStates.indexOf(to), 1);
        }
    };
    remove_tall = (state) => {
        this.remove_tfrom(state);
        this.remove_tto(state);
    };

    /**
     *
     * @param {String} from
     * @param {String} to
     * @returns {String[]}
     */
    t = (from, to, filter = false) => {
        return this.transitions
            .filter((t) => t.fromState === from && t.toStates.includes(to))
            .map((t) => t.symbol)
            .filter((t) => !filter || t !== "");
    };

    /**
     *
     * @param {String} label
     * @returns {Array}
     */
    tout = (label) => {
        return this.transitions.filter((t) => t.fromState === label);
    };

    /**
     *
     * @param {String} label
     * @returns {Array}
     */
    tins = (label) => {
        return this.transitions.filter((t) => t.toStates.includes(label));
    };

    /**
     *
     * @param {String} label
     * @returns {Array}
     */
    lout = (label) => {
        const res = new Set();
        this.tout(label).forEach((t) =>
            t.toStates.forEach((l) => l !== label && res.add(l))
        );
        return [...res.values()];
    };

    /**
     *
     * @param {String} label
     * @returns {Array}
     */
    lins = (label) => {
        const res = new Set();
        this.tins(label).forEach(
            ({ fromState: from }) => from !== label && res.add(from)
        );
        return [...res.values()];
    };

    add_s = (label) => this.states.push(label);
    index_s = (label) => this.states.findIndex((s) => s == label);
    remove_s = (label) => {
        const n = this.index_s(label);
        if (n === -1) return;
        // Remove all transitions that contains this state
        this.remove_tall(label);

        this.states.splice(n, 1);
    };

    constructor(data) {
        if (typeof data === "string") data = noam.fsm.parseFsmFromString(data);
        this.data = data;
    }

    toRegex() {
        // Do validation
        this.data = noam.fsm.removeUnreachableStates(this.data);
        if (!noam.fsm.validate(this.data)) {
            console.log("FSM Not Valid");

            return;
        }

        const { states, accepting, transitions, initial } = this;

        const start = "__s__",
            end = "__e__";

        // Add Start and Ending states
        this.add_s(start);
        this.add_s(end);
        this.add_t(start, initial, "");
        accepting.forEach((a) => this.add_t(a, end, ""));
        this.data.initialState = start;
        this.data.acceptingStates = [end];

        let counter = 0; // To avoid infinite loop
        while (states.length > 2 && counter < states.length) {
            // Get Intermeddiate of start
            const imd = this.lout(start).filter((l) => this.hasPath(l, end));

            imd.forEach((state) => {
                if (state === end) return;
                this.stateEliminateDelete(state, start, end);
            });

            counter++;
        }

        return this.data.transitions
            .filter((t) => t.fromState === start && t.toStates.includes(end))
            .map((t) => (t.symbol === "" ? "$" : t.symbol))
            .join("+");
    }

    stateEliminateDelete(state, start, end) {
        // console.log(`Deleting ${state}`);

        const transitions = this.transitions;

        const outs = this.lout(state).filter((l) => {
                const isNotDeadState = this.hasPath(l, end);
                if (!isNotDeadState) this.remove_s(l);
                return isNotDeadState;
            }),
            ins = this.lins(state);

        // console.log(`Transitions: `, transitions);
        // console.log(`Outs: `, outs);
        // console.log(`Ins: `, ins);

        // Find looping systems
        for (let i = 0; i < outs.length; i++) {
            const s = outs[i];

            if (s === state) return;

            const pathToEnd = this.path(s, end).slice(1, -1);
            if (pathToEnd.includes(state)) {
                // console.log(`Looping: ${s} Entrance: ${state}`);
                // Delete the state "s" first before continuing
                this.stateEliminateDelete(s, start, end);
                // Remove S in the outgoings and ingoings (if found)
                outs.splice(i, 1); i--;
                const insIndex = ins.indexOf(s);
                if(insIndex !== -1) ins.splice(insIndex, 1);
            }
        }

        // Handle Ingoings
        ins.forEach((s) => {
            if (s === state) return;

            const targets = outs;

            targets.forEach((d) => {
                const ts = this.wrap(this.t(s, state), "+");
                const sl = this.wrap(this.t(state, state), "*");
                const sd = this.wrap(this.t(state, d), "+");

                this.add_t(s, d, ts + sl + sd);
            });
        });

        this.remove_s(state);
        // console.log(state);
        // console.log(structuredClone(this.data));
    }

    wrap(transitions, operation) {
        if (operation === "+") {
            return transitions.length === 1
                ? transitions[0]
                : transitions.length > 1
                ? this.wrapIfNot(transitions.join(operation))
                : "";
        } else if (operation === "*") {
            return transitions.length === 1
                ? `${
                      transitions[0].length === 1
                          ? transitions
                          : `${this.wrapIfNot(transitions[0])}`
                  }*`
                : transitions.length > 1
                ? `${this.wrapIfNot(this.wrap(transitions, "+"))}*`
                : "";
        }
    }

    /**
     *
     * @param {String} str
     * @returns
     */
    wrapIfNot(str) {
        if (str[0] === "(" && str.endsWith(")")) return str;
        else return `(${str})`;
    }

    hasPath(from, to) {
        const nvs = [from],
            vs = new Set();

        let counter = 0;
        while (nvs.length > 0) {
            const s = nvs.shift();
            if (s === to) return true;
            vs.add(s);

            const outs = new Set();

            this.tout(s).forEach((os) =>
                os.toStates.forEach((l) => !vs.has(l) && outs.add(l))
            );

            nvs.push(...outs.values());
            counter++;

            if (counter > this.states.length ** 2) {
                console.log("BROKE PATHFINDING");
                break;
            }
        }

        return false;
    }

    path(from, to) {
        const nvs = [
                {
                    label: from,
                    from: "",
                },
            ],
            vs = [];

        let counter = 0;
        while (nvs.length > 0) {
            const { label: s, from: prev } = nvs.shift();
            vs.push({ label: s, from: prev });

            if (s === to) {
                let target = to,
                    path = [to];
                while (target !== from) {
                    const { from } = vs.find((v) => v.label === target);
                    path.unshift(from);
                    target = from;
                }

                return path;
            }

            const outs = new Set();

            this.tout(s).forEach((os) =>
                os.toStates.forEach(
                    (l) => !vs.find((v) => v.label === l) && outs.add(l)
                )
            );
            nvs.push(
                ...[...outs.values()].map((v) => {
                    return {
                        label: v,
                        from: s,
                    };
                })
            );
            counter++;

            if (counter > this.states.length ** 2) {
                console.log("BROKE PATHFINDING");
                break;
            }
        }

        return [];
    }
}