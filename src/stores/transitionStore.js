import Transition from "@/commons/graph/Transition";
import { defineStore } from "pinia";
import { reactive } from "vue";
import { useStateStore } from "./stateStore";
import { useMainStore } from "./mainStore";

export const useTransitionStore = defineStore('transition', () => {

    const stateStore = useStateStore(),
        mainStore = useMainStore();

    /**@type {Transition[]} */
    const transitions = reactive([]);

    const addTransition = ({labels, from, to}) => {
        // Find first if said transition is existing
        const i = getTransitionIndex(from, to);
        if(i === -1){
            // Add transition if not found
            const f = stateStore.getState(from),
                t = stateStore.getState(to);
            transitions.push(new Transition(f, t, ...labels));
        }else{
            // Just add the new labels to the transition
            transitions[i].v.splice(0);
            transitions[i].addValue(...labels);
            
            if(labels.length === 0) removeTransition(from, to);
        }
        
        mainStore.genRegex();
    }

    const getTransitionIndex = (from, to) => {
        return transitions.findIndex(t => t.equalWith(from, to));
    }

    const getTransition = (from, to) => transitions.find(t => t.equalWith(from, to));

    const getTransitionsFrom = from => transitions.filter(t => t.from.label === from);

    const getTransitionsTo = to => transitions.filter(t => t.to.label === to);

    const removeTransition = (from, to) => {
        const i = getTransitionIndex(from, to);
        if(i === -1) return;
        transitions[i].v.splice(0);
        transitions.splice(i , 1);
        mainStore.genRegex();
    }

    return {
        addTransition,
        getTransitionIndex,
        getTransition,
        removeTransition,
        transitions,
        getTransitionsFrom,
        getTransitionsTo
    }
})