<template>
    <v-btn
        variant="tonal"
        size="small"
        icon>
        
        <v-icon>mdi-cog</v-icon>

        <v-dialog
            v-model="expand"
            activator="parent"
            width="500px"
            max-height="80vh">
            <v-sheet
            class="px-3 p-2 flex flex-col pb-4">

                <div class="text-2xl">
                    Settings
                </div>

                <div class="flex-grow overflow-y-auto flex flex-col gap-2 pt-2">
                    
                    <div class=text-caption>Conversion</div>
                    <div class="pl-5 flex flex-col ">
                        <!--  Simplification -->
                        <div>
                            <v-switch
                                color="primary"
                                v-model="settingsStore.simplifyDFARegex"
                                hide-details
                                density="compact">

                                <template v-slot:label>
                                    Simplified DFA-Regex
                                    <span class="ml-1 bg-neutral-500/50 rounded-full w-5 h-5 flex justify-center items-center">
                                        
                                        <v-icon size="xs">mdi-help</v-icon>

                                        <v-tooltip
                                            activator="parent">
                                            Optimizes the result conversion to its most minimized version. <br>
                                            $ - symbolizes the empty string
                                        </v-tooltip>
                                    </span>
                                </template>

                            </v-switch>
                        </div>
                        <!-- NFA MODE -->
                        <div>
                            <v-switch
                                color="primary"
                                v-model="settingsStore.nfaMode"
                                hide-details
                                density="compact">

                                <template v-slot:label>
                                    NFA Mode
                                </template>

                            </v-switch>
                        </div>
                        <!-- Hide Epsilon -->
                        <div>
                            <v-switch
                                color="primary"
                                v-model="settingsStore.hideEpsilon"
                                hide-details
                                density="compact">

                                <template v-slot:label>
                                    Hide Epsilon
                                </template>

                            </v-switch>
                        </div>
                    </div>

                    <div class="text-caption">Miscellaneous</div>
                    <div class="px-5 flex flex-col gap-2">
                        <div>
                            <v-switch
                                color="primary"
                                v-model="settingsStore.saveFSMOnExit"
                                hide-details
                                density="compact"
                                label="Save FSM on exit">

                            </v-switch>
                        </div>
                        <div>
                            <v-btn elevation="3" block
                                @click="copyFormalSpecs">
                                Copy current machine formal specifications
                            </v-btn>
                        </div>
                    </div>

                    <!-- <div class="text-caption">Dev</div>
                    <div class=px-5 flex flex-col gap-2>
                        <div>
                            <v-btn
                                @click="log">
                                Log
                            </v-btn>
                        </div>
                    </div> -->
                </div>

            </v-sheet>
        </v-dialog>

    </v-btn>
</template>

<script setup>
import { FSM } from '@/commons/graph/Converter';
import Util from '../commons/Util';
import { useMainStore } from '@/stores/mainStore';
import { useSettingStore } from '@/stores/settingsStore';
import { ref } from 'vue';


const mainStore = useMainStore();

const settingsStore = useSettingStore();

const expand = ref(false);

const copyFormalSpecs = () => {
    const text = mainStore.formal_specs;
    Util.copyToClipboard(text);
}

const log = () => {
    const str = mainStore.formal_specs;
    const fsm = new FSM(str);
}

</script>

<style lang="scss" scoped>

</style>