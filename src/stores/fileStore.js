import { defineStore } from "pinia";
import { useAlphabetStore } from "./alphabetStore";
import { useStateStore } from "./stateStore";
import { useTransitionStore } from "./transitionStore";
import { useMainStore } from "./mainStore";
import State from "@/commons/graph/State";

const saveAsFile = (data, filename) => {
    const pom = document.createElement('a');
    pom.setAttribute('href', `data:text/plain;charset-utf-8,${encodeURIComponent(data)}`);
    pom.setAttribute("download", filename);

    if(document.createEvent){
        const ev = document.createEvent("MouseEvent");
        ev.initEvent('click', true, true);
        pom.dispatchEvent(ev);
    }else{
        pom.click();
    }
}

export const useFileStore = defineStore('file', () => {
    
    const alphabetStore = useAlphabetStore(),
        stateStore = useStateStore(),
        transitionStore = useTransitionStore(),
        mainStore = useMainStore();

    const saveDFA = filename => {
        // Get all alphabet
        const alphabet = [...alphabetStore.alphabet];
        // Get all states, and their positions, and configurations (start/end)
        const states = stateStore.states.map(s => {
            return {
                label: s.label,
                x: s.pos.x,
                y: s.pos.y
            }
        })
        // Get all transitions
        const transitions = transitionStore.transitions.map(t => {
            return {
                values: [...t.v],
                from: t.from.label,
                to: t.to.label
            }
        })
        // Get DFA Information
        const start = stateStore.savedStart?.label,
            final = stateStore.accepting.map(s => s.label);

        // Save as json string
        saveAsFile(JSON.stringify({
            alphabet: alphabet,
            states: states,
            transitions: transitions,
            start: start,
            final: final
        }), `${filename}.json`);
    }

    const loadDFA = data => {
        const { alphabet, final, states, transitions, start } = data;

        console.log("Imported Data: ", data);

        mainStore.deleteAll();
        alphabetStore.removeAll();

        try {
            // Add alphabet
            alphabet.forEach(a => alphabetStore.addAlphabet(a));

            // Generate States
            states.forEach(s => {
                const gen = new State(s.x, s.y);
                gen.label = s.label;

                if(final.includes(s.label)) gen.isFinish = true;
                stateStore.addState(gen);
            })

            if(start) stateStore.setStart(start);

            // Generate Transitions
            transitions.forEach(t => {
                const { values, from, to } = t;

                transitionStore.addTransition({
                    labels: values,
                    from: from,
                    to: to
                })
            })

            mainStore.genRegex();
        }catch(err){
            console.log(err);
            alert("Please import a correct file");
        }
    }

    return {
        saveDFA,
        loadDFA
    }
})