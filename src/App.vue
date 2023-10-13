<template>
  <v-app>
    <v-main class="flex h-screen w-screen min-h-0">
        <!-- Options / Settings -->
        <v-sheet width="400px" class="p-3 flex flex-col gap-2 overflow-auto">

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
            <v-sheet height="100%" width="50px" color="#252525" elevation="3" class="flex flex-col gap-2 p-2 justify-between" id="toolbar">

              <div class="flex flex-col gap-2">
                
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

              </div>

              <div class="flex-col gap-2">
                <!-- Delete All -->
                <div class="pt-1">
                  <v-btn @click="mainStore.deleteAll()"> 🗑️ 
                    <v-tooltip
                      activator="parent"
                      class="p-0"
                      content-class="hotkey-tooltip">
                        <span class="capitalize">Delete All</span>
                    </v-tooltip>
                  </v-btn>
                </div>

                <!-- Import/Export -->
                <div class="pt-1">
                <div class="pt-1">
                  <input type="file" class="sr-only" ref="fileinput" @change="loadJSON" >
                  <v-btn
                    @click="fileinput.click()">
                    <v-icon size="large">mdi-import</v-icon>
                    <v-tooltip
                      activator="parent"
                      class="p-0"
                      content-class="hotkey-tooltip">
                        <span class="capitalize">Import</span>
                    </v-tooltip>
                  </v-btn>
                </div>
                  <v-btn>
                    <v-icon >mdi-export</v-icon>
                    <v-tooltip
                      activator="parent"
                      class="p-0"
                      content-class="hotkey-tooltip">
                        <span class="capitalize">Export</span>
                    </v-tooltip>
                    <v-dialog
                      activator="parent">

                        <SaveFile />

                    </v-dialog>
                  </v-btn>
                </div>
              </div>
            </v-sheet>

            <FSMVisualizer class="flex-grow" />

          </div>

          <v-sheet class="flex items-center" color="#2A2A2A">

            <v-text-field v-model="regex" label="Regex" hideDetails rounded="0" variant="solo-filled" @keydown.enter="e => mainStore.genDFA(e.target.value)"/>

          </v-sheet>
        </v-sheet>

        <div class="absolute right-0 p-4">
          <SettingsMenu />
        </div>

    </v-main>
  </v-app>
  <!-- Dialog -->
  <TransitionFab />
</template>

<script>

import { computed, ref } from 'vue';
import { watch } from 'vue';
import { reactive } from 'vue';
import { onMounted } from 'vue';

// Stores
import { useMainStore } from './stores/mainStore';
import { useModeStore } from './stores/modeStore';
import { useAlphabetStore } from './stores/alphabetStore';
import { useTransitionStore } from './stores/transitionStore';
import { useStateStore } from './stores/stateStore';
import { useFileStore } from './stores/fileStore';
import { useSettingStore } from './stores/settingsStore';

// Components
import FSMVisualizer from './components/FSMVisualizer.vue';
import AlphabetLister from './components/AlphabetLister.vue';
import TransitionFab from './components/TransitionFab.vue';
import StateHelper from './components/StateHelper.vue';
import SettingsMenu from './components/SettingsMenu.vue';
import SaveFile from './components/SaveFile.vue';

export default {
  name: 'App',
  components: {
    FSMVisualizer,
    AlphabetLister,
    TransitionFab,
    StateHelper,
    SettingsMenu,
    SaveFile
  },
  setup() {

    // Initialize Store Modules
    const mainStore = useMainStore(),
      modeStore = useModeStore(),
      alphabetStore = useAlphabetStore(),
      transitionStore = useTransitionStore(),
      stateStore = useStateStore(),
      settingsStore = useSettingStore(),
      fileStore = useFileStore();

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

    const fileinput = ref(null);
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

    const loadJSON = async () => {
      const file = fileinput.value.files.length === 0 ? null : await fileinput.value.files[0].text();

      if(file === null) return;
      
      fileStore.loadDFA(JSON.parse(file));
    }
    
    // Load settings on local storage
    settingsStore.sync();

    return {
      mainStore,
      m,
      tools,
      regex,
      fileinput,
      loadJSON
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
