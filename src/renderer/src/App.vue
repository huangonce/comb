<script setup lang="ts">
import { RouterView } from 'vue-router'

import useAutoUpdate from '../src/composables/useElectronUpdate'

useAutoUpdate()
</script>

<template>
  <RouterView></RouterView>
  <!-- <q-btn color="primary" label="Primary" @click="ipcHandle" />
  <Versions /> -->
</template>
