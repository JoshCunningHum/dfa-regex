<template>
    <div>
        <v-dialog
            @click:outside="cancel"
            v-model="open"
            width="auto"
            min-width="300px">
            <v-sheet class="flex gap-2 p-4 pt-3 flex-col">
                <div class="text-2xl pb-1">Create Transition 
                    <div class="text-subtitle-1 text-neutral-400">
                        {{ modeStore.linkStart }} → {{ modeStore.linkEnd }}
                    </div>
                </div>
                <v-btn-toggle
                    multiple
                    class="flex-col h-auto"
                    rounded="0"
                    v-model="selectedItems">
                    <v-btn v-for="a in alphabet" :key="a"
                        style="height: 36px;" :value="a">
                        {{  a }}
                    </v-btn>
                </v-btn-toggle>
                <div>
                    <v-btn :disabled="selectedItems.length === 0" block color="success" @click="add">
                        Add
                    </v-btn>
                </div>
            </v-sheet>
        </v-dialog>
    </div>
</template>

<script>
import { useAlphabetStore } from '@/stores/alphabetStore';
import { useModeStore } from '@/stores/modeStore';
import { useTransitionStore } from '@/stores/transitionStore';
import { useMainStore } from '@/stores/mainStore';
import { watch } from 'vue';
import { ref } from 'vue';
import { computed } from 'vue';

export default {
    setup () {
        const modeStore = useModeStore();
        const alphabetStore = useAlphabetStore();
        const transitionStore = useTransitionStore();
        const mainStore = useMainStore();

        const open = computed({
            get: () => modeStore.openTransitionDialog,
            set: v => modeStore.openTransitionDialog = v
        });

        watch(open, v => {
            const { linkStart: start, linkEnd: end } = modeStore;
            // Find existing label
            const ex = transitionStore.getTransition(start, end);
            if(ex === undefined) return;

            selectedItems.value.push(...ex.v);

            mainStore.inputFocus();
        })

        const alphabet = computed(() => alphabetStore.alphabet);
        const selectedItems = ref([]);

        const cancel = () => {
            modeStore.linkReset();
            selectedItems.value.splice(0);
        }

        const add = () => {

            transitionStore.addTransition({
                labels: [...selectedItems.value],
                from: modeStore.linkStart,
                to: modeStore.linkEnd
            })

            selectedItems.value.splice(0);
            open.value = false;
            modeStore.linkReset();
        }

        return {
            open,
            alphabet,
            modeStore,
            selectedItems,
            
            cancel,
            add,

            transitionStore,
            modeStore
        }
    }
}
</script>

<style lang="scss" scoped>
.v-btn-toggle {
    flex-direction: column;
}
</style>