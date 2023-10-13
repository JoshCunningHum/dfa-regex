import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useMainStore } from "./mainStore";

export const useSettingStore = defineStore('setting', () => {
    const mainStore = useMainStore();

    const simplifyDFARegex = ref(false);

    watch(simplifyDFARegex, () => {
        mainStore.genRegex();
    })

    return {
        simplifyDFARegex
    }
});