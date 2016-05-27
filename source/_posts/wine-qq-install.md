---
title: QQ轻聊版 for Ubuntu
date: 2016-05-27 13:40:50
tags: 
- wine
- QQ
- Ubuntu
categories:
- wine
---
这里介绍在Ubuntu系统安装QQ轻聊版的步骤
# wine环境准备
通过以下命令安装winehq-devel，其它版本的wine可能会出现各种问题
``` shell
sudo add-apt-repository ppa:wine/wine-builds
sudo apt-get update
sudo apt-get install winehq-devel
```
如果你之前运行过wine的话，需要删除的`~/.wine`目录，建议备份后再删除。
<!-- more -->
# 配置wine
运行`winecfg`,第一次运行时可能会弹出安装组件的提示，点击安装就好，在`应用程序`页签底部，`Windows版本`，选择为"8.1"。8.0可能也是可以的，但我选的是8.1。

设置为 windows 8.1，打开所有外部链接，比如qq空间等，会使用内置的IE浏览器。如果不喜欢这个行为，在安装后QQ后，可以用`winecfg`修改为`Windows XP`，增加一个`QQProtect.exe`设置，将其单独设置为`Windows 8.1`即可。

# 安装QQ轻聊版
[官方下载页面:http://im.qq.com/lightqq/](http://im.qq.com/lightqq/)
目前的最新版是7.9，下载完后进入下载目录，使用wine命令安装：`wine ./QQ7.9Light.exe`
安装完成，弹出QQ登陆窗口，先退出即可，因为这时无法输入QQ帐号的，需要替换两个DLL才行

# 替换DLL
下载 DLL：[riched20.dll](/download/riched20.dll "点击下载") 和 [iphlpapi.dll](/download/iphlpapi.dll "点击下载")
替换`.wine/drive_c/windows/system32`目录下对应的`.dll`

# 修改注册表
``` shell
vim ~/.wine/user.reg
```
添加：
``` shell
[Software\\Wine\\DllOverrides] 1447325077 6869640
#time=1d11d37208b6b08
"*iphlpapi"="native"
"*riched20"="native,builtin"
"*qcap"=""
"txplatform.exe"=""
"txupd.exe"=""
```
** 说明 **
1. 禁用 qcap 的原因是“禁用本地摄像头”（如果有的话），因为 wine 目前的摄像头处理跟 QQ 所需要调用的接口仍有差距，本地摄像头打开会崩溃，结果是视频聊天时如果使用了本地摄像头会崩溃。禁用后，虽然不能使用本地的视频，但远程的视频可以正常使用。
1. 替换 riched20.dll，是为了让“登录对话框可以输入”。
1. 替换 iphlpapi.dll，是避免登录后的崩溃退出。如果出现QQ运行不了，可以试着去掉这一项。
1. 禁用 txplatform.exe，是因为这个进程在 wine QQ 退出后不退出，对于 Windows 倒是无所谓，对于 Linux 来说，这意味着后台跑着一堆 wine 进程。
1. 禁用 txupd.exe，是因为它在后台定期检查更新时会偶发崩溃，不影响使用，但总弹“wine 崩溃对话框”也是不好的。

# 替换字体
解决QQ界面字体显示为`方框`的问题。
将以下代码保存为`.reg`格式的文件，如：`font.reg`,在终端运行`wine regedit`,在弹出的注册表界面导入该文件。
``` regedit
[HKEY_LOCAL_MACHINE\Software\Microsoft\Windows NT\CurrentVersion\FontSubstitutes]
"Arial"="simsun"
"Arial CE,238"="simsun"
"Arial CYR,204"="simsun"
"Arial Greek,161"="simsun"
"Arial TUR,162"="simsun"
"Courier New"="simsun"
"Courier New CE,238"="simsun"
"Courier New CYR,204"="simsun"
"Courier New Greek,161"="simsun"
"Courier New TUR,162"="simsun"
"FixedSys"="simsun"
"Helv"="simsun"
"Helvetica"="simsun"
"MS Sans Serif"="simsun"
"MS Shell Dlg"="simsun"
"MS Shell Dlg 2"="simsun"
"System"="simsun"
"Tahoma"="simsun"
"Times"="simsun"
"Times New Roman CE,238"="simsun"
"Times New Roman CYR,204"="simsun"
"Times New Roman Greek,161"="simsun"
"Times New Roman TUR,162"="simsun"
"Tms Rmn"="simsun"
```

# 运行QQ
``` shell
cd ~/.wine/drive_c/Program\ Files/Tencent/QQLite/Bin
wine ./QQScLauncher.exe
```
如果是64位的Ubuntu路径则应该为`~/.wine/drive_c/Program Files (x86)/Tencent/QQLite/Bin`

# 添加Desktop Entry
Desktop Entry类似windows的快捷方式
将以下代码保存为`.desktop`格式的文件，如：`wine-qq.desktop`
``` shell
[Desktop Entry]
#"快捷方式"名称
Name=QQ
#这里是要执行的命令，wine 后面要写QQScLauncher.exe的绝对路径
Exec=wine "/home/xxx/.wine/drive_c/xxx/QQScLauncher.exe"
#这是指定快捷方式图片，在网上随便找一张QQ图片就是了
Icon=/xxx/qq.png
Terminal=false
Type=Application
Categories=GNOME;Application;Documentation;
MimeType=application/x-ms-dos-executable;application/x-msi;application/x-ms-shortcut;
```
将`wine-qq.desktop` 文件放到 `/usr/share/applications/`或`~/.local/share/applications`
``` shell
sudo mv wine-qq.desktop ~/.local/share/applications/
```
这时启动器中就能找到对应的`快捷方式`了
