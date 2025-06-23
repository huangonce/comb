<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useQuasar } from 'quasar'
// import Versions from './components/Versions.vue'

// const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

const $q = useQuasar()

// console.log($q.dark.isActive)
// console.log($q.dark.mode)
// $q.dark.set(false)

onMounted(() => {
  $q.dialog({
    title: 'Welcome to Quasar',
    message: 'This is a simple dialog example.',
    ok: {
      label: 'Got it',
      color: 'primary'
    }
  })
})
</script>

<template>
  <RouterView></RouterView>
  <!-- <q-btn color="primary" label="Primary" @click="ipcHandle" />
  <Versions /> -->
</template>
