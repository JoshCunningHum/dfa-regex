<template>
    <div>
        <v-btn
            v-show="stepStore.steps.length > 0"
            icon
            size="small"
            variant="tonal">
            <v-icon>mdi-autorenew</v-icon>

            <v-tooltip
                activator="parent">
                Step by Step Process
            </v-tooltip>

            <v-dialog
                max-height="90%"
                max-width="700px"
                min-height="0"
                width="90%"
                height="min-content"
                activator="parent"
                class="d-flex">
                <v-sheet class="p-3 d-flex flex-col flex-grow gap-2 overflow-auto">

                    <div class="flex flex-col gap-2">
                        <v-card v-for="step in stepStore.steps" :key="step.title"
                        variant="tonal">
                        <v-card-title @click="console.log(step.data)">{{ step.title }}</v-card-title>
                        <v-sheet width="100%" height="min-content" color="white">
                            <VizDot :data="dotify(step.data)" />
                        </v-sheet>
                    </v-card>
                    </div>
                    
                </v-sheet>
            </v-dialog>
        </v-btn>
    </div>
</template>

<script setup>
import noam from '@/plugins/noam';
import VizDot from './VizDot.vue';
import { useStepStore } from '@/stores/stepStore';

const stepStore = useStepStore();

const dotify = fsm => {
    return noam.fsm.printDotFormat(fsm);
}

</script>

<style lang="scss" scoped>
</style>