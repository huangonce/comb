import { ElectronAPI } from '@electron-toolkit/preload'
import { UpdateInfo, ProgressInfo } from 'electron-updater'
interface ElectronUpdateAPI {
  onUpdateAvailable: (
    listener: ((event: Electron.IpcRendererEvent, info: UpdateInfo) => void) | null
  ) => void
  onUpdateNotAvailable: (
    listener: ((event: Electron.IpcRendererEvent, info: UpdateInfo) => void) | null
  ) => void
  onDownloadProgress: (
    listener: ((event: Electron.IpcRendererEvent, progress: ProgressInfo) => void) | null
  ) => void
  onUpdateDownloaded: (
    listener: ((event: Electron.IpcRendererEvent, info: UpdateDownloadedEvent) => void) | null
  ) => void
  onUpdateError: (
    listener: ((event: Electron.IpcRendererEvent, error: string) => void) | null
  ) => void
  startDownloadUpdate: () => Promise<void>
  installUpdate: () => Promise<void>
  checkForUpdates: () => Promise<void>
  removeAllListeners?: (channel: string) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ElectronUpdateAPI
  }
}
