<template>
  <v-app>
    <v-main class="flex h-screen w-screen min-h-0">
        <!-- Options / Settings -->
        <v-sheet width="300px" class="p-3 flex flex-col gap-2 overflow-auto">

          <!-- Alphabet -->
          <AlphabetLister />

          <v-divider></v-divider>

          <!-- Node Selector -->
          <StateHelper />

        </v-sheet>

        <!-- DFA Visualizer -->
        <v-sheet class="flex-grow bg-neutral-900 flex flex-col">

          <div class="flex flex-grow">
            <!-- Controls -->
            <v-sheet height="100%" width="50px" color="#252525" elevation="3" class=" flex-col gap-2 p-2" id="toolbar">

              <v-btn-toggle v-model="m" class="flex-col gap-2 items-center w-full h-auto" mandatory rounded="0">

                <v-btn v-for="t in tools" :key="t.name" :value="t.name">
                  {{ t.text }}
                  <v-tooltip
                    activator="parent"
                    class="p-0"
                    contentClass="hotkey-tooltip"
                    >
                    <span class="capitalize">{{t.name}}</span> Mode [{{ t.hotkey }}]
                  </v-tooltip>
                </v-btn>

              </v-btn-toggle>

              <div class="pt-1">
                <v-btn @click="mainStore.deleteAll()"> 🗑️ </v-btn>
              </div>

            </v-sheet>

            <FSMVisualizer class="flex-grow" />

          </div>

          <v-sheet class="flex items-center" color="#2A2A2A">

            <v-text-field v-model="regex" label="Regex" hideDetails rounded="0" variant="solo-filled" @keydown.enter="e => mainStore.genDFA(e.target.value)"/>

          </v-sheet>
        </v-sheet>


    </v-main>
  </v-app>
  <!-- Dialog -->
  <TransitionFab />
</template>

<script>

import { computed, ref } from 'vue';
import { watch } from 'vue';
import { reactive } from 'vue';

// Stores
import { useMainStore } from './stores/mainStore';
import { useModeStore } from './stores/modeStore';
import { useAlphabetStore } from './stores/alphabetStore';
import { useTransitionStore } from './stores/transitionStore';
import { useStateStore } from './stores/stateStore';

// Components
import FSMVisualizer from './components/FSMVisualizer.vue';
import AlphabetLister from './components/AlphabetLister.vue';
import TransitionFab from './components/TransitionFab.vue';
import StateHelper from './components/StateHelper.vue';

export default {
  name: 'App',
  components: {
    FSMVisualizer,
    AlphabetLister,
    TransitionFab,
    StateHelper
  },
  setup() {

    // Initialize Store Modules
    const mainStore = useMainStore(),
      modeStore = useModeStore(),
      alphabetStore = useAlphabetStore(),
      transitionStore = useTransitionStore(),
      stateStore = useStateStore();

    const tools = reactive([
      {
        name: 'default',
        text: '➕',
        hotkey: 'V',
      },
      {
        name: 'linking',
        text: '🔗',
        hotkey: 'C',
      },
      {
        name: 'delete',
        text: '❌',
        hotkey: 'D',
      }
    ]);

    const regex = ref('');
    const regexResult = computed(() => mainStore.regexResult);

      watch(regexResult, v => {
        if(v === '') return;

        regex.value = regexResult.value;
      })

    const m = computed({
      get: () => modeStore.mode,
      set: v => modeStore.mode = v
    });

    return {
      mainStore,
      m,
      tools,
      regex
    }
  },
}
</script>

<style lang="scss">
* {
  box-sizing: border-box;
}

html,
body {
  overflow-y: auto;
}

html {
  overflow-y: hidden !important;
}

.v-btn.smolbtn {
  padding-left: 0;
  padding-right: 0;
  min-width: 0;
}

#toolbar {
  button {
    @apply p-2 rounded;

    min-width: 0;

  }
}

.hotkey-tooltip {
  padding: 2px 10px !important;
  border-radius: 2px !important;
  background: #252525 !important;
  color: #aaa !important;
}
</style>
