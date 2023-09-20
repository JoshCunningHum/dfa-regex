import { defineStore } from "pinia";
import { reactive } from "vue";
import { useTransitionStore } from "./transitionStore";
import { useMainStore } from "./mainStore";


const MAX_ALHPABET = 10;

export const useAlphabetStore = defineStore('alphabet', () => {
    const alphabet = reactive(['a', 'b']);

    const transitionStore = useTransitionStore(),
        mainStore = useMainStore();
        
    const removeAlphabet = c => {
        const i = alphabet.indexOf(c);
        if(i === - 1) return;
        alphabet.splice(i, 1);

        // Remove all occurences in all transition of the said alphabet
        transitionStore.transitions.forEach(t => t.removeValue(c));
        mainStore.genRegex();
    }

    const removeAll = () => {
        alphabet.forEach(ap => removeAlphabet(ap));
    }

    const addAlphabet = c => {
        if(alphabet.length >= MAX_ALHPABET) return;

        c = c.trim();
        if(c === '') return;
        const i = alphabet.indexOf(c);
        if(i === -1) {
            alphabet.push(c);
            mainStore.genRegex();
        }
    }

    const resetAlphabet = () => {
        alphabet.splice(0);
        alphabet.push('a', 'b');
        mainStore.genRegex();
    }

    return {
        alphabet,
        addAlphabet,
        removeAlphabet,
        resetAlphabet,
        removeAll
    }
})