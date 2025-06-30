import { Tray, Menu, nativeImage, app, BrowserWindow, Notification } from 'electron'
import path from 'path'
import { is } from '@electron-toolkit/utils'
import { UpdateInfo } from 'electron-updater'

// 系统托盘管理类
export class TrayManager {
  private tray: Tray | null = null
  private mainWindow: BrowserWindow
  private updateInfo: UpdateInfo | null = null
  private updateAvailable = false
  private downloadProgress = 0

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.createTray()
    this.setupEventListeners()
  }

  // 创建系统托盘
  private createTray(): void {
    // 创建托盘图标
    const iconPath = this.getTrayIconPath()
    const image = nativeImage.createFromPath(iconPath)

    // 调整图标尺寸以适应不同平台
    const size = process.platform === 'win32' ? 32 : 16
    image.resize({ width: size, height: size })

    this.tray = new Tray(image)

    // 设置托盘提示
    this.tray.setToolTip(app.getName())

    // 点击托盘图标事件
    this.tray.on('click', () => this.toggleWindow())

    // 右键菜单
    this.updateMenu()
  }

  // 获取托盘图标路径
  private getTrayIconPath(): string {
    const basePath = is.dev
      ? path.join(__dirname, '../../resources')
      : path.join(process.resourcesPath, 'resources')

    return path.join(basePath, 'tray-icon.png')
  }

  // 更新托盘菜单
  public updateMenu(): void {
    if (!this.tray) return

    const contextMenu = Menu.buildFromTemplate([
      {
        label: `${app.getName()} v${app.getVersion()}`,
        enabled: false
      },
      { type: 'separator' },
      ...(this.updateAvailable
        ? [
            {
              label: `安装更新 (v${this.updateInfo?.version})`,
              click: () => this.installUpdate()
            },
            {
              label: `下载进度: ${this.downloadProgress}%`,
              enabled: false
            }
          ]
        : [
            {
              label: '检查更新',
              click: () => this.checkForUpdates()
            }
          ]),
      { type: 'separator' },
      {
        label: this.mainWindow.isVisible() ? '隐藏窗口' : '显示窗口',
        click: () => this.toggleWindow()
      },
      {
        label: '关于',
        click: () => this.showAbout()
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => app.quit()
      }
    ])

    this.tray.setContextMenu(contextMenu)
  }

  // 切换窗口显示/隐藏
  private toggleWindow(): void {
    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide()
    } else {
      this.mainWindow.show()
      this.mainWindow.focus()
    }
  }

  // 检查更新
  private checkForUpdates(): void {
    this.mainWindow.webContents.send('check-for-updates')
  }

  // 安装更新
  private installUpdate(): void {
    this.mainWindow.webContents.send('install-update')
  }

  // 显示关于信息
  private showAbout(): void {
    this.mainWindow.webContents.send('show-about')
  }

  // 显示通知
  public showNotification(options: { title: string; body: string }): void {
    if (Notification.isSupported()) {
      new Notification({
        title: options.title,
        body: options.body
      }).show()
    }
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    // 监听窗口最小化事件
    this.mainWindow.on('minimize', () => {
      this.mainWindow.hide()

      this.showNotification({
        title: app.getName(),
        body: '应用程序已最小化到系统托盘'
      })
    })
  }

  // 更新托盘状态（自动更新相关）
  public setUpdateStatus(available: boolean, info?: UpdateInfo): void {
    this.updateAvailable = available
    this.updateInfo = info || null
    this.updateMenu()

    if (available && info) {
      this.showNotification({
        title: `${app.getName()} 新版本可用`,
        body: `v${info.version} 已准备好安装`
      })
    }
  }

  // 更新下载进度
  public setDownloadProgress(progress: number): void {
    this.downloadProgress = Math.floor(progress)
    this.updateMenu()
  }

  // 销毁托盘
  public destroy(): void {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }
}
