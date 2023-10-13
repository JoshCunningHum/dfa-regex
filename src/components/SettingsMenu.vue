<template>
    <v-btn
        variant="tonal"
        size="small"
        icon>
        
        <v-icon>mdi-cog</v-icon>

        <v-dialog
            v-model="expand"
            activator="parent"
            width="500px">
            <v-sheet
            class="p-2">
                <div>
                    Test
                </div>
            </v-sheet>
        </v-dialog>

    </v-btn>
</template>

<script setup>
import { ref } from 'vue';

const expand = ref(false);

</script>

<style lang="scss" scoped>

</style>