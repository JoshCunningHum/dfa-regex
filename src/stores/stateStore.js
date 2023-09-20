import State from "@/commons/graph/State";
import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { useTransitionStore } from "./transitionStore";
import { useMainStore } from "./mainStore";

export const useStateStore = defineStore('state', () => {

    const transitionStore = useTransitionStore(),
        mainStore = useMainStore();

    /**@type {State[]} */
    const states = reactive([]);

    /**
     * @param {State} state 
     */
    const addState = (state) => {
        states.push(state);
        mainStore.genRegex();
    };

    const getStateIndex = label => states.findIndex(s => s.label === label),
        getState = label => states.find(s => s.label === label);

    const removeState = (label) => {
        const i = getStateIndex(label);
        if(i === -1) return;

        // Find all transitions that is connected to this state
        const froms = transitionStore.getTransitionsFrom(label);
        froms.forEach(f => transitionStore.removeTransition(f.from.label, f.to.label));

        const tos = transitionStore.getTransitionsTo(label);
        tos.forEach(t => transitionStore.removeTransition(t.from.label, t.to.label));

        if(mainStore.selected.label === label) mainStore.select(undefined);

        states.splice(i , 1);
        mainStore.genRegex();
    }

    const savedStart = ref(undefined);

    const setStart = (c) => {
        const t = getState(c);

        if(savedStart.value === undefined) {
            savedStart.value = t;
        } else {
            savedStart.value.isStart = false;
            savedStart.value = t;
        }

        t.isStart = true;

        mainStore.genRegex();
    }

    const accepting = computed(() => states.filter(s => s.isFinish));

    return {
        states,
        addState,
        getStateIndex,
        getState,
        removeState,
        setStart,
        savedStart,
        accepting
    }
})