Set WshShell = WScript.CreateObject("WScript.Shell")
' 进入当前目录，运行app.py
WshShell.Run "python app.py", 0
' 等待1500毫秒
WScript.Sleep 1500
' 自动打开浏览器
WshShell.Run "http://127.0.0.1:5000"