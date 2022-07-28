# 🎹 MIDI Board

## 插件简介

MIDI Board is a netless app for Musician, MIDI maker and Music educator.

## 快速体验

1. 访问[声网Workshop](https://workshop.netless.link/)获取临时配置环境用于测试

2. 将本仓库clone到本地
    ```
    git clone https://github.com/CorpDreams/midi-board.git
    ```

3. 复制根目录下的`.env.example`并重命名为`.env`后，分别填写文件中的`VITE_APPID`, `VITE_ROOM_UUID` 和 `VITE_ROOM_TOKEN`为刚刚获取的临时环境

    也可直接使用以下测试用环境（不保证最新可用）：
    ```
    # Whiteboard SDK App ID
    VITE_APPID=ss4WoMf_EeqfCXcv33LmiA/izfIC88inXYJKw

    # Whiteboard Room UUID
    VITE_ROOM_UUID=aea16cd0035d11edb96c9b6e4baebda2

    # Whiteboard Room Token
    VITE_ROOM_TOKEN=NETLESSROOM_YWs9VWtNUk92M1JIN2I2Z284dCZleHBpcmVBdD0xNjYwMzg1NjQxNjk0Jm5vbmNlPWFlYmVkZmUwLTAzNWQtMTFlZC04OWQxLTNmZjQ1Mzc3YzYxNyZyb2xlPTEmc2lnPTY5OWI4ODQwYWI4MGJkNmRlOGJhNWJkYTdiZjExNzUwMDBiMTg1ZjdkNmVlZTY3Y2I1ZjRlZDZiNmYzZjAyMDAmdXVpZD1hZWExNmNkMDAzNWQxMWVkYjk2YzliNmU0YmFlYmRhMg
    ```

4. 在根目录使用命令行运行以下命令

    ``` sh
    cd midi-board
    npm install
    npm start
    ```

    运行完成后浏览器会自动打开本地服务器URL（如果没有请手动[访问](http://localhost:3000)，默认端口为3000），此时可看到白板应用demo已启动，点击右侧工具栏最后一个按钮打开插件列表，点击其中的`MidiBoard`即可使用本插件~