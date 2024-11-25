<p align="center">
  <img src="/resources/icon.png" alt="logo" width="120">
</p>
<h2 align="center">Strawberry</h2>
<h4 align="center">OpenAI ChatGPT 客户端(linux, mac, win)</h4>

![Static Badge](https://img.shields.io/badge/i18n-2_languages-blue)
![GitHub Release](https://img.shields.io/github/v/release/classfang/strawberry)
![GitHub Release Date](https://img.shields.io/github/release-date/classfang/strawberry)
![GitHub last commit](https://img.shields.io/github/last-commit/classfang/strawberry)
![GitHub License](https://img.shields.io/github/license/classfang/strawberry)
![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/classfang/strawberry/total)
![GitHub repo size](https://img.shields.io/github/repo-size/classfang/strawberry)

## 1. 为什么选择 Strawberry

只需一个 API Key，即可体验按需付费的 ChatGPT 最新能力。

国内**OpenAI API代理**参考仓库：[零代码、零成本代理OpenAI等限制访问的接口](https://github.com/classfang/openai-api-vercel-proxy)

<img src="/demo/zhCN/1.png" alt="demo">

<img src="/demo/zhCN/2.png" alt="demo">

<img src="/demo/zhCN/3.png" alt="demo">

<img src="/demo/zhCN/4.png" alt="demo">

## 2. 开发路线和贡献

我们希望为 Strawberry 添加更多功能。目前最重要的是：

- [x] 文本对话
- [x] 重新生成
- [x] 发音
- [x] 图片输入
- [x] 文件输入
- [x] 清理缓存
- [x] 系统指令
- [x] 指令库
- [x] 互联网搜索
- [x] 图片生成
- [x] 数据备份
- [x] 记忆
- [x] 总结网页内容
- [x] 断开上下文
- [x] 归档
- [x] 获取屏幕截图
- [x] Token 统计
- [x] 日历备忘

如果你有任何建议或者想法，非常欢迎在 [discussions](https://github.com/classfang/strawberry/discussions) 打开一个话题来讨论。

## 3. 最新安装包

你可以在 [releases](https://github.com/classfang/strawberry/releases) 中找到个平台的安装包。

如果遇到任何安装和使用问题，欢迎提交 issue。

### 3.1. App 在 macOS 下提示已损坏无法打开解决办法

打开终端，输入以下命令，并执行：

```shell
sudo xattr -d com.apple.quarantine /Applications/Strawberry.app
```

注意：/Applications/Strawberry.app 换成你的App路径。

## 4. 开发

### 4.1 克隆仓库

```shell
git clone https://github.com/classfang/chatgpt-plus.git
```

### 4.2 安装依赖

```shell
yarn install
```

### 4.3 运行

```shell
yarn dev
```

### 4.4 构建

```shell
yarn build:mac
```

