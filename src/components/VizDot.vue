<template>
    <div ref="root" class="w-full" @click="console.log(dot)">

    </div>
</template>

<script setup>
import { instance } from '@viz-js/viz';
import { computed } from 'vue';
import { onMounted } from 'vue';
import { ref } from 'vue';

const root = ref(null);

const props = defineProps({
    data: String
})

const dot = computed(() => props.data);


onMounted(() => {
    instance().then(viz => {
        const svg = viz.renderSVGElement(dot.value);
        svg.style.width = "100%";
        root.value.append(svg);
    })
})


</script>

<style lang="scss" scoped>
svg {
    width: 100%;
}
</style>