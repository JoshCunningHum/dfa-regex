<template>
    <div class="flex justify-center">
        <v-sheet class="px-4 p-2 pb-4 gap-2 d-flex flex-col" rounded min-width="300px">
            <div class="text-xl">Save File As</div>
            <div>
                <v-text-field 
                    variant="outlined"
                    label="Filename"
                    v-model="filename"
                    :rules="[v => !!v || 'Please assign a file name']"/>
            </div>
            <div>
                <v-btn color="success" block :disabled="filename === '' || filename === null"
                    @click="save">Save</v-btn>
            </div>
        </v-sheet>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useFileStore } from '../stores/fileStore';

const fileStore = useFileStore();

const filename = ref('');

const save = () => {
    fileStore.saveDFA(filename.value);
}

</script>

<style lang="scss" scoped>

</style>