import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useStepStore = defineStore('step', () => {

    const steps = reactive([]);

    const setSteps = values => {
        steps.splice(0);
        steps.push(...values);
    }

    return {
        setSteps,
        steps
    }
})