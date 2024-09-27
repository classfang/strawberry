const fs = require('fs')
const path = require('path')

console.log('generate-build-info run')

// 获取当前日期时间
const buildTime = new Date().getTime()

// 将构建日期写入文件
const filePath = path.join(__dirname, '../src/renderer/src/assets/json/build-info.json')
fs.writeFileSync(filePath, JSON.stringify({ buildTime }), 'utf-8')

console.log('generate-build-info end')
