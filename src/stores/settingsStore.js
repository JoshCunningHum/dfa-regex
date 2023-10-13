import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useMainStore } from "./mainStore";
import Local from "@/commons/Local";
import { useFileStore } from "./fileStore";

export const useSettingStore = defineStore('setting', () => {
    const mainStore = useMainStore(),
        fileStore = useFileStore();

    const simplifyDFARegex = ref(true);
    const saveFSMOnExit = ref(false);

    watch(simplifyDFARegex, () => {
        mainStore.genRegex();
    })

    const startSync = () => {
        // Sync with local storage
        const data = Local.get('config');

        if(data !== null) {

            simplifyDFARegex.value = data.simplifyDFARegex;
            saveFSMOnExit.value = data.saveFSMOnExit;
    
            if(saveFSMOnExit.value) fileStore.loadDFA(data.fsmData);
        }

        // Listen for when the page closes/refreshes
        window.addEventListener("beforeunload", () => save());
    }

    const save = () => {
        // Save current settings to local storage
        const fsmData = saveFSMOnExit.value ? fileStore.getFSMAsJSON() : null;

        Local.set('config', {
            simplifyDFARegex: simplifyDFARegex.value,
            saveFSMOnExit: saveFSMOnExit.value,
            fsmData: fsmData
        })
    }

    return {
        simplifyDFARegex,
        saveFSMOnExit,
        sync: startSync
    }
});