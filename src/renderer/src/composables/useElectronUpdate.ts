import { ref, onMounted, onBeforeUnmount, h } from 'vue'
import { useQuasar, type QDialogOptions } from 'quasar'

type UpdateStatus = 'idle' | 'available' | 'downloading' | 'downloaded' | 'error'

// 定义事件处理函数类型 - 与预加载脚本完全匹配
type UpdateAvailableHandler = (event: unknown, info: unknown) => void
type UpdateNotAvailableHandler = (event: unknown, info: unknown) => void
type DownloadProgressHandler = (event: unknown, progress: unknown) => void
type UpdateDownloadedHandler = (event: unknown, info: unknown) => void
type UpdateErrorHandler = (event: unknown, error: string) => void

const useElectronAutoUpdater = (): void => {
  const $q = useQuasar()

  const status = ref<UpdateStatus>('idle')
  const updateInfo = ref<unknown>(null)
  const progressPercent = ref(0)
  const errorMessage = ref('')
  const notificationId = ref<string | null>(null)
  const showProgressBar = ref(false)

  // 存储事件处理函数引用，用于后续清理
  const handlers = {
    onUpdateAvailable: null as UpdateAvailableHandler | null,
    onUpdateNotAvailable: null as UpdateNotAvailableHandler | null,
    onDownloadProgress: null as DownloadProgressHandler | null,
    onUpdateDownloaded: null as UpdateDownloadedHandler | null,
    onUpdateError: null as UpdateErrorHandler | null
  }

  // 检查是否在Electron环境中
  const isElectron = (): boolean => !!window.api

  // 清除当前通知
  const clearNotification = (): void => {
    if (notificationId.value) {
      Notification.remove(notificationId.value)
      notificationId.value = null
    }
  }

  // 显示通知
  const showNotification = (options: QDialogOptions): void => {
    const d = $q
      .dialog({
        ...options
      })
      .onOk(() => {
        // console.log('>>>> OK')
      })
      .onOk(() => {
        // console.log('>>>> second OK catcher')
      })
      .onCancel(() => {
        // console.log('>>>> Cancel')
      })
      .onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
  }

  // 显示可用更新通知
  const showUpdateAvailableNotification = (info: unknown): void => {
    status.value = 'available'
    updateInfo.value = info
    showProgressBar.value = false

    // 尝试提取版本号
    let version = '新版本'
    if (info && typeof info === 'object' && 'version' in info) {
      version = (info as { version: string }).version
    }

    showNotification({
      title: '发现新版本',
      content: `版本 ${version} 已可用，是否立即下载？`,
      footer: () =>
        h(Space, null, {
          default: () => [
            h(
              Button,
              {
                type: 'secondary',
                size: 'small',
                onClick: () => clearNotification(),
                icon: () => h(IconClose)
              },
              { default: () => '稍后' }
            ),
            h(
              Button,
              {
                type: 'primary',
                size: 'small',
                onClick: () => {
                  clearNotification()
                  window.api.startDownloadUpdate()
                },
                icon: () => h(IconDownload)
              },
              { default: () => '下载更新' }
            )
          ]
        })
    })
  }

  // 显示无更新通知
  const showNoUpdateNotification = () => {
    status.value = 'idle'
    showProgressBar.value = false
    clearNotification()

    Notification.success({
      title: '已是最新版本',
      content: '当前应用已是最新版本',
      duration: 3000,
      closable: true,
      position: 'bottomRight'
    })
  }

  // 显示下载完成通知
  const showUpdateDownloadedNotification = (info: unknown) => {
    status.value = 'downloaded'
    showProgressBar.value = false

    // 尝试提取版本号
    let version = '新版本'
    if (info && typeof info === 'object' && 'version' in info) {
      version = (info as { version: string }).version
    }

    showNotification({
      title: '更新已下载完成',
      content: `版本 ${version} 已下载完成，是否立即安装？`,
      footer: () =>
        h(Space, null, {
          default: () => [
            h(
              Button,
              {
                type: 'secondary',
                size: 'small',
                onClick: () => clearNotification(),
                icon: () => h(IconClose)
              },
              { default: () => '稍后' }
            ),
            h(
              Button,
              {
                type: 'primary',
                size: 'small',
                onClick: () => {
                  clearNotification()
                  window.api.installUpdate()
                },
                icon: () => h(IconCheckCircleFill)
              },
              { default: () => '安装并重启' }
            )
          ]
        })
    })
  }

  // 显示错误通知
  const showErrorNotification = (error: string): void => {
    status.value = 'error'
    errorMessage.value = error
    showProgressBar.value = false

    // 截断过长的错误信息
    const truncatedError = error.length > 100 ? `${error.substring(0, 100)}...` : error

    showNotification({
      title: '更新失败',
      content: `错误: ${truncatedError}`,
      footer: () =>
        h(Space, null, {
          default: () => [
            h(
              Button,
              {
                type: 'secondary',
                size: 'small',
                onClick: () => clearNotification(),
                icon: () => h(IconClose)
              },
              { default: () => '关闭' }
            ),
            h(
              Button,
              {
                type: 'primary',
                size: 'small',
                onClick: () => {
                  clearNotification()
                  window.api.checkForUpdates()
                },
                icon: () => h(IconRefresh)
              },
              { default: () => '重试' }
            )
          ]
        })
    })
  }

  // 事件处理：更新可用
  const handleUpdateAvailable: UpdateAvailableHandler = (_event, info) => {
    showUpdateAvailableNotification(info)
  }

  // 事件处理：无更新
  const handleUpdateNotAvailable: UpdateNotAvailableHandler = () => {
    showNoUpdateNotification()
  }

  // 事件处理：下载进度
  const handleDownloadProgress: DownloadProgressHandler = (_event, progress) => {
    status.value = 'downloading'
    showProgressBar.value = true

    // 安全地访问 progress 对象的 percent 属性
    let percent = 0
    if (progress && typeof progress === 'object' && 'percent' in progress) {
      percent = Math.floor((progress as { percent: number }).percent)
    }

    progressPercent.value = percent / 100

    console.log(`下载进度: ${progressPercent.value}%`)
    // progressBarElement.value = createProgressBar(percent)
    // showProgressNotification(percent)
  }

  // 事件处理：下载完成
  const handleUpdateDownloaded: UpdateDownloadedHandler = (_event, info) => {
    showUpdateDownloadedNotification(info)
  }

  // 事件处理：错误
  const handleUpdateError: UpdateErrorHandler = (_event, error) => {
    showErrorNotification(error)
  }

  const init = () => {
    if (!isElectron()) {
      console.warn('o_0')
      // 开发环境下模拟更新流程
      // if (import.meta.env.DEV) {
      //   setTimeout(() => {
      //     showUpdateAvailableNotification({
      //       version: '1.0.1',
      //       releaseDate: new Date().toISOString(),
      //     })
      //   }, 3000)
      // }
      return
    }

    // 保存处理函数引用
    handlers.onUpdateAvailable = handleUpdateAvailable
    handlers.onUpdateNotAvailable = handleUpdateNotAvailable
    handlers.onDownloadProgress = handleDownloadProgress
    handlers.onUpdateDownloaded = handleUpdateDownloaded
    handlers.onUpdateError = handleUpdateError

    // 注册事件监听 - 使用保存的处理函数
    window.api.onUpdateAvailable(handlers.onUpdateAvailable)
    window.api.onUpdateNotAvailable(handlers.onUpdateNotAvailable)
    window.api.onDownloadProgress(handlers.onDownloadProgress)
    window.api.onUpdateDownloaded(handlers.onUpdateDownloaded)
    window.api.onUpdateError(handlers.onUpdateError)

    // 初始检查更新
    window.api.checkForUpdates().catch((error) => {
      console.error('检查更新失败:', error)
      showErrorNotification(`检查更新失败: ${error.message}`)
    })
  }

  const cleanup = () => {
    if (!isElectron()) return

    // 移除所有事件监听器 - 使用预加载脚本支持的方式
    window.api.onUpdateAvailable(null)
    window.api.onUpdateNotAvailable(null)
    window.api.onDownloadProgress(null)
    window.api.onUpdateDownloaded(null)
    window.api.onUpdateError(null)

    // 重置处理函数引用
    handlers.onUpdateAvailable = null
    handlers.onUpdateNotAvailable = null
    handlers.onDownloadProgress = null
    handlers.onUpdateDownloaded = null
    handlers.onUpdateError = null

    // 清除通知
    clearNotification()
    showProgressBar.value = false
  }

  onMounted(() => setTimeout(init, 1000))
  onBeforeUnmount(cleanup)

  return {
    status,
    updateInfo,
    progressPercent,
    errorMessage,
    showProgressBar,

    clearNotification,
    isElectron,

    checkForUpdates: () => window.api?.checkForUpdates(),
    startDownloadUpdate: () => window.api?.startDownloadUpdate(),
    installUpdate: () => window.api?.installUpdate()
  }
}

export default useElectronAutoUpdater
