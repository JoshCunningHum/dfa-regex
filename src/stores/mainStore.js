import { focus, getMonitor, initCanvas, monitor } from "@/commons/canvas/CanvasInit";
import State from "@/commons/graph/State";
import Transition from "@/commons/graph/Transition";
import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { useStateStore } from "./stateStore";
import { useTransitionStore } from "./transitionStore";
import noam from "@/plugins/noam";
import Victor from "victor";
import { useAlphabetStore } from "./alphabetStore";

export const useMainStore = defineStore("main", () => {

    const stateStore = useStateStore(),
        transitionStore = useTransitionStore(),
        alphabetStore = useAlphabetStore();

    /**@type {State} */
    const selected = ref(undefined),
        selectedOrigin = ref({x: 0, y: 0});

    // Input Processor
    const processInput = c => {
        // set height and width;
        c.width = c.clientWidth;
        c.height = c.clientHeight;

        monitor(c);
        initCanvas();
    }

    const select = o => {
        selected.value = o;
        if(!(o instanceof State)) return;
        
        selectedOrigin.value.x = o.pos?.x;
        selectedOrigin.value.y = o.pos?.y;
    }

    const inputFocus = () => focus();

    const deleteAll = () => {
        select(undefined);
        stateStore.states.splice(0);
        transitionStore.transitions.splice(0);
    }

    const checkForValidity = () => {
        const states = stateStore.states,
            transition = transitionStore.transitions,
            initial = stateStore.savedStart,
            accepting = stateStore.accepting;


        if(initial === undefined ||
            states.length === 0 ||
            transition.length === 0 ||
            accepting.length === 0) return false;

            // TODO: More checks

        return true;
    }

    const genDFA = regex => {
        deleteAll();

        let a;

        try{
            
            a = noam.re.string.toAutomaton(regex);
            a = noam.fsm.convertEnfaToNfa(a);
            a = noam.fsm.convertNfaToDfa(a);
            a = noam.fsm.minimize(a);
            a = noam.fsm.convertStatesToNumbers(a);
            
        }catch(err){
            console.log(err);
        }

        const { states: st, alphabet: al, acceptingStates: acc, initialState: ini, transitions: trs} = a;

        const { clientHeight: h, clientWidth: w } = getMonitor();

        const hand = new Victor(0, 250),
            center = new Victor(w/2, h/2);

        // Set alphabet
        alphabetStore.removeAll();
        al.forEach(c => alphabetStore.addAlphabet(c));

        // Generate the states first (circular layout)
        st.forEach((s, i) => {
            const gens = new State(...hand.clone().add(center).toArray(), `q${s}`);
            stateStore.addState(gens)
            if(s === ini) gens.isStart = true;
            hand.rotateDeg(360 / st.length);
            if(acc.includes(s)) gens.isFinish = true;
        })

        // Set transitions
        trs.forEach(t => {

            const { fromState, symbol, toStates: toStateArr } = t,
                toState = toStateArr[0];

            transitionStore.addTransition({
                labels: [symbol],
                from: `q${fromState}`,
                to: `q${toState}`
            })
        })
    }

    const regexResult = ref('');

    const genRegex = () => {

        console.log('generating');
        // validate first
        if(!checkForValidity()) return;

        const states = stateStore.states,
            transition = transitionStore.transitions,
            initial = stateStore.savedStart,
            accepting = stateStore.accepting;

        const str = `#state
        ${states.map(s => s.label).join('\n')}
        #initial
        ${initial}
        #accepting
        ${accepting.map(a => a.label).join('\n')}
        #alphabet
        ${alphabetStore.alphabet.join('\n')}
        #transitions
        ${transition.map(t => t.str).join('\n')}`;

        let a, r;

        try {
            a = noam.fsm.parseFsmFromString(str);
            a = noam.fsm.minimize(a);
            r = noam.re.tree.simplify(r, {"useFsmPatterns": false});
            r = noam.re.tree.toString(r);
        }catch(err){
            regexResult.value = '';
            console.log(err);
        }

        console.log(r);
        regexResult.value = r;
    }

    return {
        processInput,
        inputFocus,

        selected,
        selectedOrigin,
        select,

        deleteAll,
        checkForValidity,
        
        genDFA,
        genRegex,
        regexResult
    }
}) 