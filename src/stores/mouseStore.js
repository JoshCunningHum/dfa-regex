import { defineStore } from "pinia"
import { ref } from "vue";

export const useMouseStore = defineStore('mouse', () => {
    
    const x = ref(0),
        y = ref(0),
        set = (nx, ny) => {
            x.value = nx;
            y.value = ny;
        }

    return {
        x,
        y,
        set
    }
})