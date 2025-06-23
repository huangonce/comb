import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar, type QDialogOptions, type DialogChainObject } from 'quasar'

type UpdateStatus = 'idle' | 'available' | 'downloading' | 'downloaded' | 'error'

// 定义事件处理函数类型 - 与预加载脚本完全匹配
type UpdateAvailableHandler = (event: unknown, info: unknown) => void
type UpdateNotAvailableHandler = (event: unknown, info: unknown) => void
type DownloadProgressHandler = (event: unknown, progress: unknown) => void
type UpdateDownloadedHandler = (event: unknown, info: unknown) => void
type UpdateErrorHandler = (event: unknown, error: string) => void

const useElectronAutoUpdater = (): {
  status: typeof status
  updateInfo: typeof updateInfo
  progressPercent: typeof progressPercent
  errorMessage: typeof errorMessage
  showProgressBar: typeof showProgressBar
  clearDialog: () => void
  isElectron: () => boolean
  checkForUpdates: () => Promise<unknown> | undefined
  startDownloadUpdate: () => unknown
  installUpdate: () => unknown
} => {
  const $q = useQuasar()

  const status = ref<UpdateStatus>('idle')
  const updateInfo = ref<unknown>(null)
  const progressPercent = ref(0)
  const errorMessage = ref('')
  const showProgressBar = ref(false)

  const dialog = ref<DialogChainObject>()

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
  const clearDialog = (): void => {
    dialog.value?.hide()
  }

  // 显示通知
  const showDialog = (options: QDialogOptions): void => {
    clearDialog()

    dialog.value = $q.dialog({
      ...options,
      dark: $q.dark.isActive,
      persistent: true
    })
  }

  // 显示可用更新通知
  const showUpdateAvailableDialog = (info: unknown): void => {
    status.value = 'available'
    updateInfo.value = info
    showProgressBar.value = false

    console.log('新版本信息:', info)

    // 尝试提取版本号
    let version = '新版本'
    if (info && typeof info === 'object' && 'version' in info) {
      version = (info as { version: string }).version
    }

    showDialog({
      title: '发现新版本',
      message: `版本 ${version} 已可用，请更新后系统后使用最新功能。`,
      ok: {
        label: '下载更新',
        color: 'primary',
        icon: 'download',
        flat: true
      }
    })

    dialog.value?.onOk(() => {
      clearDialog()
      window.api.startDownloadUpdate()
    })
  }

  // 显示无更新通知
  const showNoUpdateNotify = (): void => {
    status.value = 'idle'
    showProgressBar.value = false

    $q.notify({
      progress: true,
      message: '当前已是最新版本',
      icon: 'info',
      color: 'white',
      textColor: 'primary',
      timeout: 3000
    })
  }

  // 显示下载完成通知
  const showUpdateDownloadedDialog = (info: unknown): void => {
    status.value = 'downloaded'
    updateInfo.value = info
    showProgressBar.value = false

    // 尝试提取版本号
    let version = '新版本'
    if (info && typeof info === 'object' && 'version' in info) {
      version = (info as { version: string }).version
    }

    showDialog({
      title: '更新已下载完成',
      message: `版本 ${version} 已下载完成，是否立即安装？`,
      ok: {
        label: '立即安装',
        color: 'primary',
        icon: 'check_circle',
        flat: true
      }
    })

    dialog.value?.onOk(() => {
      clearDialog()
      window.api.installUpdate()
    })
  }

  // 显示错误通知
  const showErrorDialog = (error: string): void => {
    status.value = 'error'
    errorMessage.value = error
    showProgressBar.value = false

    // 截断过长的错误信息
    const truncatedError = error.length > 100 ? `${error.substring(0, 100)}...` : error

    showDialog({
      title: '更新错误',
      message: `发生错误: ${truncatedError}`,
      ok: {
        label: '关闭',
        color: 'secondary',
        icon: 'close'
      },
      cancel: {
        label: '重试',
        icon: 'refresh'
      }
    })

    dialog.value
      ?.onOk(() => {
        clearDialog()
      })
      .onCancel(() => {
        clearDialog()
        window.api.checkForUpdates()
      })
  }

  // 事件处理：更新可用
  const handleUpdateAvailable: UpdateAvailableHandler = (_event, info) => {
    showUpdateAvailableDialog(info)
  }

  // 事件处理：无更新
  const handleUpdateNotAvailable: UpdateNotAvailableHandler = () => {
    showNoUpdateNotify()
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
    // showProgressDialog(percent)
  }

  // 事件处理：下载完成
  const handleUpdateDownloaded: UpdateDownloadedHandler = (_event, info) => {
    showUpdateDownloadedDialog(info)
  }

  // 事件处理：错误
  const handleUpdateError: UpdateErrorHandler = (_event, error) => {
    showErrorDialog(error)
  }

  const init = (): void => {
    if (!isElectron()) {
      console.warn('o_0')
      // 开发环境下模拟更新流程
      // if (import.meta.env.DEV) {
      //   setTimeout(() => {
      //     showUpdateAvailableDialog({
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
      showErrorDialog(`检查更新失败: ${error.message}`)
    })
  }

  const cleanup = (): void => {
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
    clearDialog()
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

    clearDialog,
    isElectron,

    checkForUpdates: () => window.api?.checkForUpdates(),
    startDownloadUpdate: () => window.api?.startDownloadUpdate(),
    installUpdate: () => window.api?.installUpdate()
  }
}

export default useElectronAutoUpdater
