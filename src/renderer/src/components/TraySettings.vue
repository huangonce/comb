<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useTrayStore } from '@renderer/stores/trayStore'

const trayStore = useTrayStore()

const closeToTray = ref(trayStore.closeToTray)
const startInTray = ref(trayStore.startInTray)
const showNotifications = ref(trayStore.showNotifications)

// 监听设置变化
watch([closeToTray, startInTray, showNotifications], () => {
  trayStore.setTraySettings({
    closeToTray: closeToTray.value,
    startInTray: startInTray.value,
    showNotifications: showNotifications.value
  })
})

onMounted(() => {
  // 初始化设置
  trayStore.initSettings()
})
</script>
<template>
  <q-card flat bordered class="q-mt-md">
    <q-card-section>
      <div class="text-h6">系统托盘设置</div>
    </q-card-section>

    <q-card-section>
      <div class="q-gutter-y-md">
        <q-toggle v-model="closeToTray" label="关闭窗口时最小化到托盘" left-label />

        <q-toggle v-model="startInTray" label="启动时最小化到托盘" left-label />

        <q-toggle v-model="showNotifications" label="显示托盘通知" left-label />
      </div>
    </q-card-section>
  </q-card>
</template>
