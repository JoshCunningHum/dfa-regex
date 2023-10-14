import { focus, getMonitor, initCanvas, monitor } from "@/commons/canvas/CanvasInit";
import State from "@/commons/graph/State";
import Transition from "@/commons/graph/Transition";
import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { useStateStore } from "./stateStore";
import { useTransitionStore } from "./transitionStore";
import noam from "@/plugins/noam";
import Victor from "victor";
import { useAlphabetStore } from "./alphabetStore";
import { useSettingStore } from "./settingsStore";
import { FSM } from "@/commons/graph/Converter";

export const useMainStore = defineStore("main", () => {

    const stateStore = useStateStore(),
        transitionStore = useTransitionStore(),
        alphabetStore = useAlphabetStore(),
        settingsStore = useSettingStore();

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
            if(!settingsStore.nfaMode){
                a = noam.fsm.convertEnfaToNfa(a);
                a = noam.fsm.convertNfaToDfa(a);
                a = noam.fsm.minimize(a);
                a = noam.fsm.convertStatesToNumbers(a);
            }
            
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

            const { fromState, symbol, toStates: toStateArr } = t;

            toStateArr.forEach(ts => {
                transitionStore.addTransition({
                    labels: [symbol],
                    from: `q${fromState}`,
                    to: `q${ts}`
                })
            })

        })
    }

    const regexResult = ref('');

    const formal_specs = computed(() => {

        const states = stateStore.states,
            transition = transitionStore.transitions,
            initial = stateStore.savedStart,
            accepting = stateStore.accepting;

        return `#states
${states.map(s => s.label).join('\n')}
#initial
${initial?.label}
#accepting
${accepting.map(a => a.label).join('\n')}
#alphabet
${alphabetStore.alphabet.join('\n')}
#transitions
${transition.map(t => t.str()).join('\n')}`;
    });

    const genRegex = () => {

        // validate first
        if(!checkForValidity()) return;

        const str = formal_specs.value;

        let a, r;

        try {
            if(!settingsStore.nfaMode && !settingsStore.simplifyDFARegex){
                const fsm = new FSM(formal_specs.value);
                r = fsm.toRegex();
            }else{
                a = noam.fsm.parseFsmFromString(str);
                if(settingsStore.simplifyDFARegex) a = noam.fsm.minimize(a);
                if(!settingsStore.nfaMode) {
                    a = noam.fsm.convertEnfaToNfa(a);
                    a = noam.fsm.convertNfaToDfa(a);
                }
                a = noam.fsm.toRegex(a);
                a = noam.re.tree.simplify(a, {"useFsmPatterns": settingsStore.simplifyDFARegex});
                r = noam.re.tree.toString(a);
            }


        }catch(err){
            regexResult.value = '';
            console.log(err);
        }

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
        regexResult,
        
        formal_specs
    }
}) 