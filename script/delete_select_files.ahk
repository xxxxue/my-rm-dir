#Requires AutoHotkey v2.0
#SingleInstance Force
#UseHook true
#Hotstring EndChars ``n``s``t

#HotIf WinActive("ahk_exe explorer.exe")

; Ctrl (RCtrl) + Delete
^Delete:: del_all()

del_all() {
    command_arr := [
        ; "D:\Software\nodejs\tsx.cmd",
        "node",
        "D:\Work\JsProject\my-rm-dir\src\main.js"
    ]
    ; 获取当前活动窗口的句柄
    activeHwnd := WinActive("A")
    ; 创建 Shell.Application 对象
    shell := ComObject("Shell.Application")
    ; 获取所有 Shell 窗口
    windows := shell.Windows
    ; 存储选中文件的路径
    paths := []
    if (paths.Length > 0) {
        paths.RemoveAt(1, paths.Length)
    }
    ; 遍历所有窗口
    for window in windows {
        try {
            ; 获取窗口句柄并检查类名
            hwnd := window.HWND
            if (hwnd != String(activeHwnd)) {
                continue
            }
            ; 确认是资源管理器窗口且为当前活动窗口
            ; 获取选中项
            selectedItems := window.Document.SelectedItems
            count := selectedItems.Count
            ; 遍历选中项并收集路径
            if (count > 0) {
                loop count {
                    ; 索引从 0 开始，使用 A_Index - 1
                    item := selectedItems.Item(A_Index - 1)
                    paths.Push(item.Path)
                }
                break ; 找到后退出循环
            }
        } catch {
            continue ; 跳过错误窗口
        }
    }

    ; 显示结果
    if (paths.Length > 0) {

        ; 按顺序 拼接命令
        cmd_arr := []

        for id, value IN command_arr {
            cmd_arr.Push(value)
        }

        for path in paths {
            cmd_arr.Push(StringUtil.wrap(path, '"'))
        }

        ; 执行命令
        Run(ArrayUtil.join(cmd_arr, " "))

    } else {
        MsgBox("no selected items")
    }
}
class StringUtil {
    static wrap(str, ch) {
        return ch str ch
    }
}
class ArrayUtil {
    /**
     * @param {Array} arr 
     * @param separator 
     */
    static join(arr, separator := ",") {
        result := ""
        len := arr.Length
        for index, item in arr {
            result := result . String(item)
            ; ahk 的索引是从1开始的,所以最后一位 等于 长度
            if (index < len) {
                result := result . separator
            }
        }
        return result
    }
}

#HotIf