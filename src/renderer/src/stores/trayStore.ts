import { defineStore } from 'pinia'
import { ref } from 'vue'

interface TraySettings {
  closeToTray: boolean
  startInTray: boolean
  showNotifications: boolean
}

export const useTrayStore = defineStore('tray', () => {
  const closeToTray = ref(true)
  const startInTray = ref(false)
  const showNotifications = ref(true)

  // 初始化设置
  const initSettings = (): void => {
    const savedSettings = localStorage.getItem('traySettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings) as TraySettings
      closeToTray.value = settings.closeToTray
      startInTray.value = settings.startInTray
      showNotifications.value = settings.showNotifications
    }
  }

  // 保存设置
  const saveSettings = (): void => {
    const settings: TraySettings = {
      closeToTray: closeToTray.value,
      startInTray: startInTray.value,
      showNotifications: showNotifications.value
    }
    localStorage.setItem('traySettings', JSON.stringify(settings))
  }

  // 设置托盘相关设置
  const setTraySettings = (settings: Partial<TraySettings>): void => {
    if (settings.closeToTray !== undefined) {
      closeToTray.value = settings.closeToTray
    }
    if (settings.startInTray !== undefined) {
      startInTray.value = settings.startInTray
    }
    if (settings.showNotifications !== undefined) {
      showNotifications.value = settings.showNotifications
    }
    saveSettings()
  }

  return {
    closeToTray,
    startInTray,
    showNotifications,
    initSettings,
    setTraySettings
  }
})
