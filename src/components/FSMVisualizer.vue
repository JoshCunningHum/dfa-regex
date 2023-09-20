<template>
    <canvas
        ref="c">

    </canvas>
</template>

<script>
import { useMainStore } from '@/stores/mainStore';
import { useAlphabetStore } from '@/stores/alphabetStore';
import { useStateStore } from '@/stores/stateStore';
import { useTransitionStore } from '@/stores/transitionStore';
import { ref, computed } from 'vue';
import { Drawables } from '@/commons/canvas/Drawables';

window.Drawables = Drawables;

export default {
    setup () {

        const c = ref(null),
            ctxRef = computed(() => c.value.getContext('2d')),
            mainStore = useMainStore(),
            alphabetStore = useAlphabetStore(),
            transitionStore = useTransitionStore(),
            stateStore = useStateStore(),
            rafID = ref(0);


        const states = computed(() => stateStore.states),
            transitions = computed(() => transitionStore.transitions);

        const animate = () => {
            const { clientHeight: h, clientWidth: w} = c.value;
            /**@type {CanvasRenderingContext2D} */
            const ctx = ctxRef.value;
            
            // Clear Canvas
            ctx.clearRect(0, 0, w, h);

            // Draw States
            states.value.forEach(s => s.draw(ctx));

            // Draw Transitions
            transitions.value.forEach(t => t.draw(ctx));

            // Draw Drawables
            Drawables.instances.forEach(d => d.draw(ctx));

            rafID.value = requestAnimationFrame(animate);
        }

        return {
            c,
            mainStore,
            
            rafID,
            animate
        }
    },
    mounted(){
        // Set canvas element to process any incoming input
        this.mainStore.processInput(this.c);

        this.animate();
    },
    beforeUnmount(){
        cancelAnimationFrame(this.rafID);
    },
    emits: ['select:node']
}
</script>

<style lang="scss" scoped>

</style>