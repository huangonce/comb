<script setup lang="ts">
import { RouterView } from 'vue-router'
// import Versions from './components/Versions.vue'

// const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <RouterView></RouterView>
  <!-- <q-btn color="primary" label="Primary" @click="ipcHandle" />
  <Versions /> -->
</template>
