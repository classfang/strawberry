# MacOS安装软件后无法启动报错:“已损坏,无法打开,你应该将它移到废纸篓”

## 报错截图

<img src="/demo/zhCN/doc/macos_open_error/1.png" alt="demo">

## 解决方法

### 1. 打开系统设置->安全性与隐私->选择任何来源

<img src="/demo/zhCN/doc/macos_open_error/2.png" alt="demo">

### 2. 如果打开没有看到"任何来源"，可尝试以下方法

打开终端输入：

```shell
sudo spctl  --master-disable
```

回车执行命令并输入密码。再重新打开`系统设置->安全性与隐私->选择任何来源`

### 3. 打开终端输入命令，先不执行

```shell
sudo xattr -r -d com.apple.quarantine
```

### 4. 将应用程序中的APP图标拖入终端自动生成路径

```shell
sudo xattr -r -d com.apple.quarantine /Applications/******.app
```

### 5. 回车并输入密码

重新打开应用即可。
