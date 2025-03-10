# ⚡ MyRmDir

> Quickly delete large folders/files, such as `node_modules` with thousands of small files

<div align="center">
<strong>
<samp>

[English](README.md) · [简体中文](README_zh.md)

</samp>
</strong>
</div>

No need to put in recycle bin

No analysis directory required

No need for real-time display to GUI

🚀 fast !!

Can be added to the Windows right-click menu registry, the operation is more convenient

# 📦 Install

```bash
npm install -g my-rm-dir
```

```bash
my-rm-dir .\node_modules
```

# Speed test

The following test data comes from removing the same `node_modules`

| Name          | Time consumed (s) |
| ------------- | ----------------- |
| NodeJS        | 15                |
| PowerShell    | 28.66             |
| normal delete | 45.55             |

# Register to right-click menu

> It is recommended to use [ContextMenuManager](https://github.com/BluePointLilac/ContextMenuManager) to manage the right-click menu, and the visual operation is more convenient.
>
> Directly create a new item, select the icon, and set the command.

## Install

- Execute `where.exe my-rm-dir` in `cmd` to get `local path`
- Open `script/install.reg` in Notepad
- Modify `E:\\Software\\NodeJs\\my-rm-dir` to `local path`. ( `\\` is very important)
- Save after modification, and double-click to execute `install.reg`

## Uninstall

Double-click `uninstall.reg` in the `script` directory

## Delete multiple files at the same time

use `script/delete_select_files.ahk`

# Screenshots

![image-20220915214510812](img.assets/image-20220915214510812.png)

![image-20220917193123079](img.assets/image-20220917193123079.png)

![image-20250205012040.png](img.assets/image-20250205012040.png)
