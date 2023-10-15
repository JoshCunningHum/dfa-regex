<template>
    <div v-if="state !== undefined" class="flex flex-grow flex-col gap-2">
        <div class="flex justify-between items-end">
            <div class="text-2xl">State</div>
            <span class="text-caption text-neutral-500">[{{ state.pos.x.toFixed(0) }}, {{ state.pos.y.toFixed(0) }}]</span>
        </div>
        <div>
            <v-text-field
                v-model="state.label"
                hide-details
                variant="solo-filled"
                label="State Label"
                density="compact"
                clearable>

            </v-text-field>
        </div>
        <div>
            <v-btn
                block
                color="#DC143C"
                @click="stateStore.removeState(label)">
                Delete State
            </v-btn>
        </div>

        <div class="px-2">
            <div>
                <v-switch
                                color="primary"
                    hide-details
                    density="compact"
                    :true-value="true"
                    :false-value="false"
                    v-model="tempIsStart"
                    @change="changeStartStatus"
                    :label="'Starting State'">
                </v-switch>
            </div>
            <div>
            <v-switch
                                color="primary"
                hide-details
                density="compact"
                v-model="state.isFinish"
                :label="'Ending State'"
                @change="mainStore.genRegex()">
            </v-switch>
            </div>
        </div>

        <div class="text-subtitle-1">
            Transitions
        </div>

        <div class="flex flex-col flex-grow gap-2">
            <div v-for="(t, index) in transArr" :key="t.to"
            class="flex gap-2">
                <div class="text-button w-12 flex justify-center items-center overflow-hidden">
                    <v-btn @click="setSelectedState(t.to)">
                        {{ t.to }}
                    </v-btn>
                </div>
                <div class="flex-grow">
                    <v-autocomplete 
                        clearable
                        chips
                        label="Labels"
                        :items="alphabet"
                        multiple
                        hide-details
                        variant="outlined"
                        @update:model-value="v => updateTransition(t.to, v, index)"
                        v-model="t.vs"
                        density="compact"/>
                </div>
            </div>
        </div>

        <div class="flex flex-col gap-2">

            <v-divider></v-divider>

            <div class="flex flex-col gap-2 pt-3">
                <div class="">
                    <v-autocomplete 
                        hide-details
                        density="compact"
                        append-icon=""
                        variant="outlined"
                        label="Destination State"
                        :items="stateList"
                        v-model="tempLabel"/>
                </div>
                <div class="flex-grow">
                    <v-autocomplete 
                        clearable
                        chips
                        label="Transition"
                        :items="alphabet"
                        append-icon=""
                        multiple
                        hide-details
                        variant="outlined"
                        v-model="tempTransitions"
                        density="compact"/>
                </div>
            </div>
            <div>
                <v-btn block color="success" @click="addTransition"> 
                    Add Transition
                </v-btn>
            </div>
        </div>
    </div>
</template>

<script>
import { useAlphabetStore } from '@/stores/alphabetStore';
import { useMainStore } from '@/stores/mainStore';
import { useStateStore } from '@/stores/stateStore';
import { useTransitionStore } from '@/stores/transitionStore';
import { reactive, onMounted } from 'vue';
import { ref } from 'vue';
import { watch } from 'vue';
import { computed } from 'vue';

export default {
    setup () {
        const mainStore = useMainStore(),
            transitionStore = useTransitionStore(),
            alphabetStore = useAlphabetStore(),
            stateStore = useStateStore();

        const state = computed(() => mainStore.selected),
            label = computed(() => state.value?.label),
            alphabet = computed(() => alphabetStore.alphabet);

        const transArr = reactive([]);

        const associatedTransitions = computed(() => transitionStore.getTransitionsFrom(label.value));

        const stateList = computed(() => stateStore.states.map(v =>  v.label)),
            tempLabel = ref(''), tempTransitions = ref([]);

        function updateTransArr(){
            transArr.splice(0);
            associatedTransitions.value.forEach(at => {
                transArr.push({
                    to: at.to.label,
                    vs: [...at.v]
                })
            })
        }

        
        const tempIsStart = ref(false);

        // watch(tempIsStart, v => {
        //     if(v) stateStore.setStart(label.value);
        //     else if(state.value) state.value.isStart = false;
        // })

        const changeStartStatus = () => {
            const v = tempIsStart.value;
            if(v) stateStore.setStart(label.value);
            else if(state.value) state.value.isStart = false;
        }

        watch(label, v => {
            transArr.splice(0);
            tempIsStart.value = false;
            if(v === undefined) return;
            updateTransArr();
            tempIsStart.value = state.value.isStart;
        })

        const updateTransition = (to, v, index) => {
            if(v.length === 0){
                transitionStore.removeTransition(label.value, to);
                transArr.splice(index, 1);
                return;
            }

            transitionStore.addTransition({
                labels: [...v],
                from: label.value,
                to: to
            })
        }   

        const setSelectedState = label => {
            const ts = stateStore.getState(label);
            mainStore.select(ts);
        }

        const addTransition = () => {
            transitionStore.addTransition({
                labels: [...tempTransitions.value],
                from: label.value,
                to: tempLabel.value
            })

            updateTransArr();
        }

        watch(state, () => {
            if(state.value !== undefined) return;
            tempLabel.value = '';
            tempTransitions.value.splice(0);
        })

        return {
            state,
            label,
            associatedTransitions,
            alphabet,
            updateTransition,
            transArr,
            setSelectedState,
            stateStore,
            stateList,
            tempLabel,
            tempTransitions,
            addTransition,
            tempIsStart,
            mainStore,
            changeStartStatus
        }
    }
}
</script>

<style lang="scss" scoped>

</style>