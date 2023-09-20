<template>
    <div class="flex flex-col gap-2">
        <!-- Alphabet -->
        <div class="flex justify-between">
          <div class="text-2xl">Alphabet</div>

          <v-btn 
            color="red" 
            density="comfortable" 
            @click="resetAlphabet"
            v-if="resetAble">Reset</v-btn>

        </div>
        
        <!-- Alphabet List -->
        <v-container class="p-0">
          <v-row
            align="center"
            justify="start"
            noGutters
            class=" gap-x-1 gap-y-0.5">
            <v-col
              v-for="c in alphabet" :key="c+''+Math.random()"
              cols="auto">
              <v-chip
                closable
                @click:close="removeAlphabet(c)"
                size="small">
                {{ c }}
              </v-chip>
            </v-col>
          </v-row>
        </v-container>

        <div class="">
          <v-text-field 
            label="Add alphabet"
            variant="solo-filled"
            placeholder="Press Enter to add" 
            v-model="temp"
            maxLength="1"
            clearable
            hideDetails
            @keydown.enter="addAlphabet(temp); temp = ''" />
        </div>
    </div>
</template>

<script>
import { useAlphabetStore } from '@/stores/alphabetStore';
import { computed, ref } from 'vue';

export default {
    setup () {
        
        const store = useAlphabetStore(),
            alphabet = computed(() => store.alphabet);

        const temp = ref('');

        const resetAble = computed(() => {

            return alphabet.value.length !== 2 ||
                !alphabet.value.every(v => v === 'a' || v === 'b');
        })

        return {
            temp,
            alphabet,
            resetAlphabet: () => store.resetAlphabet(),
            removeAlphabet: c => store.removeAlphabet(c),
            addAlphabet: c => store.addAlphabet(c),

            resetAble
        }
    }
}
</script>

<style lang="scss" scoped>

</style>