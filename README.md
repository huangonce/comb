# comb

An Electron application with Vue and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```


npx electron-builder build --win --publish always

Playwright


comb/
├── src/
│   ├── main/       # 主进程代码
│   │   └── index.js
│   ├── preload/    # 预加载脚本
│   │   └── index.js
│   └── renderer/   # 渲染进程代码
│       ├── index.html
│       └── main.jsx
├── electron.vite.config.js  # 配置文件
└── package.json
