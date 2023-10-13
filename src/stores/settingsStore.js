import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useMainStore } from "./mainStore";
import Local from "@/commons/Local";

export const useSettingStore = defineStore('setting', () => {
    const mainStore = useMainStore();

    const simplifyDFARegex = ref(true);
    const saveFSMOnExit = ref(false);

    watch(simplifyDFARegex, () => {
        mainStore.genRegex();
        save();
    })

    watch(saveFSMOnExit, () => {
        save();
    })

    const sync = () => {
        // Sync with local storage
        const data = Local.get('config');

        if(data === null) return;

        simplifyDFARegex.value = data.simplifyDFARegex;
        saveFSMOnExit.value = data.saveFSMOnExit;
    }

    const save = () => {
        // Save current settings to local storage
        Local.set('config', {
            simplifyDFARegex: simplifyDFARegex.value,
            saveFSMOnExit: saveFSMOnExit.value
        })
    }

    return {
        simplifyDFARegex,
        saveFSMOnExit,
        sync
    }
});