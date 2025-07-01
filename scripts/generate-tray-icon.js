// scripts/generate-tray-icon.js
import { createCanvas } from 'canvas'
import fs from 'fs'
import path from 'path'
// 创建32x32托盘图标
const canvas = createCanvas(32, 32)
const ctx = canvas.getContext('2d')

// 绘制蓝色圆形背景
ctx.beginPath()
ctx.arc(16, 16, 15, 0, Math.PI * 2)
ctx.fillStyle = '#1976D2'
ctx.fill()

// 绘制白色应用图标 (示例)
ctx.fillStyle = '#FFFFFF'
ctx.font = 'bold 20px Arial'
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText('A', 16, 16)

// 保存图标
const outputPath = path.join(__dirname, '../resources/tray-icon.png')
const buffer = canvas.toBuffer('image/png')
fs.writeFileSync(outputPath, buffer)

console.log('托盘图标已生成:', outputPath)
