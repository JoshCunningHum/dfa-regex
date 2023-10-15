<template>
    <div class="flex relative">
        
        <canvas class="flex-grow"
            ref="c">

        </canvas>
        <div class="absolute right-0 bottom-0 z-50 p-3 flex flex-col gap-2">
            <StepByStep />

            <v-btn variant="tonal"
                size="small"
                icon
                @click="forceDirectiveEnabled = !forceDirectiveEnabled">
                <v-icon>mdi-{{ forceDirectiveEnabled ? 'arrow-collapse-all' : 'asterisk'}}</v-icon>

                <v-tooltip
                    activator="parent">
                    Force Directive Mode : <span :class="forceDirectiveEnabled ? 'success' : 'danger'">{{ forceDirectiveEnabled ? 'ON' : 'OFF' }}</span>
                </v-tooltip>

            </v-btn>
        </div>

    </div>
</template>

<script>
import { useMainStore } from '@/stores/mainStore';
import { useForceStore } from '@/stores/forceStore';
import { useStateStore } from '@/stores/stateStore';
import { useTransitionStore } from '@/stores/transitionStore';
import { useModeStore } from '@/stores/modeStore';
import { useStepStore } from '@/stores/stepStore';

import StepByStep from './StepByStep.vue';

import { Drawables } from '@/commons/canvas/Drawables';
import { ref, computed } from 'vue';

window.Drawables = Drawables;

export default {
    setup () {

        const c = ref(null),
            ctxRef = computed(() => c.value.getContext('2d')),
            mainStore = useMainStore(),
            transitionStore = useTransitionStore(),
            stateStore = useStateStore(),
            modeStore = useModeStore(),
            stepStore = useStepStore(),
            forceStore = useForceStore(),
            rafID = ref(0);

        const forceDirectiveEnabled = ref(false);

        const states = computed(() => stateStore.states),
            transitions = computed(() => transitionStore.transitions);

        const animate = () => {
            const { clientHeight: h, clientWidth: w} = c.value;

            /**@type {CanvasRenderingContext2D} */
            const ctx = ctxRef.value;
            
            // Clear Canvas
            ctx.clearRect(0, 0, w, h);

            // Force Directive Layout
            if(forceDirectiveEnabled.value) forceStore.tick();
            else forceStore.stop();

            // Put a sign to dbl click on Default Mode when no states exists
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#444';
            ctx.font = '45px Roboto';
            if(states.value.length === 0 && modeStore.mode === 'default') ctx.fillText('Double click to create a state', w / 2, h / 2);

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
            forceStore,
            stepStore,
            
            rafID,
            animate,
            forceDirectiveEnabled
        }
    },
    components: {
        StepByStep
    },
    mounted(){
        // Set canvas element to process any incoming input
        this.mainStore.processInput(this.c);
        this.forceStore.setDimensions(this.c.clientWidth, this.c.clientHeight);
        this.animate();
    },
    beforeUnmount(){
        cancelAnimationFrame(this.rafID);
    },
    emits: ['select:node']
}
</script>

<style lang="scss" scoped>
.danger {
    @apply text-rose-600;
}

.success {
    @apply text-lime-800;
}
</style>