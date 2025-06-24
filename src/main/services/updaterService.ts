import { BrowserWindow, ipcMain, dialog, app } from 'electron'
import {
  autoUpdater,
  type UpdateInfo,
  type ProgressInfo,
  type UpdateDownloadedEvent
} from 'electron-updater'
import DOMPurify from 'dompurify'
import path from 'path'
import fs from 'fs/promises'
import log from 'electron-log'

// 配置日志
log.transports.file.level = 'info'
autoUpdater.logger = log

// 全局变量跟踪主窗口
let mainWindowRef: WeakRef<BrowserWindow> | null = null

// 确保安全发送消息到渲染进程
function safeSend(channel: string, ...args: unknown[]): void {
  const window = mainWindowRef?.deref()
  if (window && !window.isDestroyed()) {
    window.webContents.send(channel, ...args)
  }
}

export enum UpdateChannel {}

export function setupAutoUpdater(mainWindow: BrowserWindow): void {
  mainWindowRef = new WeakRef(mainWindow)

  // 配置自动更新
  autoUpdater.autoDownload = false

  // 主窗口就绪后检查更新
  mainWindow.webContents.once('did-finish-load', () => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.error('检查更新失败:', err)
      safeSend('update-error', DOMPurify.sanitize(err.message))
    })
  })

  // 添加手动检查的 IPC 调用
  ipcMain.handle('checking-for-update', () => {
    autoUpdater.checkForUpdates()
  })

  // 监听更新可用事件
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    safeSend('update-available', info)
  })

  // 监听更新不可用事件
  autoUpdater.on('update-not-available', (info: UpdateInfo) => {
    safeSend('update-not-available', info)
  })

  // 监听下载进度事件
  autoUpdater.on('download-progress', (progress: ProgressInfo) => {
    safeSend('download-progress', {
      percent: Math.floor(progress.percent),
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total
    })
  })

  // 监听更新下载完成事件
  autoUpdater.on('update-downloaded', (info: UpdateDownloadedEvent) => {
    safeSend('update-downloaded', info)
  })

  // 监听错误事件
  autoUpdater.on('error', (err) => {
    safeSend('update-error', err.message)

    // 开发环境下显示错误弹窗
    if (!app.isPackaged) {
      dialog.showErrorBox('更新错误', err.message)
    }
  })

  // 处理渲染进程的下载请求
  ipcMain.handle('start-download-update', () => {
    autoUpdater.downloadUpdate()
  })

  // 处理渲染进程的安装请求
  ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall()
  })

  mainWindow.on('closed', () => {
    mainWindowRef = null
  })
}

// 开发环境模拟更新
export async function setupDevAutoUpdate(): Promise<void> {
  if (!app.isPackaged) {
    const configPath = path.join(app.getAppPath(), 'dev-app-update.yml')
    try {
      await fs.access(configPath)
      autoUpdater.updateConfigPath = configPath
    } catch (error) {
      log.warn('开发环境下未找到更新配置文件:', error)
    }

    autoUpdater.forceDevUpdateConfig = true

    // // 模拟更新检查
    // setTimeout(() => {
    //   safeSend('update-available', {
    //     version: '1.0.3',
    //     releaseDate: new Date().toISOString()
    //   })
    // }, 5000)
  }
}
