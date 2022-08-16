# 🎹 MIDI Board

## 插件简介

MIDI Board is a Netless app for Musician, MIDI maker and Music educator.

MIDI Board是一个适用于声网 Netless互动白板的插件，为音乐人、MIDI制作者以及音乐教育工作者提供MIDI文件的编辑与预览。通过本插件，可以实现多端、多用户协同的MIDI编、作曲工作并导出，也可用于线上的音乐相关教学。

## 安装方法

1. 访问[声网Workshop](https://workshop.netless.link/)获取临时配置环境用于测试

2. 将本仓库clone到本地并进入根目录
    ```
    git clone https://github.com/CorpDreams/app-midi-board.git
    cd app-midi-board
    ```

3. 复制根目录下的`.env.example`并重命名为`.env`后，分别填写文件中的`VITE_APPID`, `VITE_ROOM_UUID` 和 `VITE_ROOM_TOKEN`为刚刚获取的临时环境

    也可直接使用以下测试用环境（不保证最新可用）：
    ```
    # Whiteboard SDK App ID
    VITE_APPID=ss4WoMf_EeqfCXcv33LmiA/izfIC88inXYJKw

    # Whiteboard Room UUID
    VITE_ROOM_UUID=c1063fe01d4311ed924cff6ad50661b2

    # Whiteboard Room Token
    VITE_ROOM_TOKEN=NETLESSROOM_YWs9VWtNUk92M1JIN2I2Z284dCZleHBpcmVBdD0xNjYzMjMzMjM1OTE2Jm5vbmNlPWMxMmE5MGMwLTFkNDMtMTFlZC1iZWMyLWNiNTUzMjEwMzFlYSZyb2xlPTEmc2lnPWU0MTVmMmZlM2Y0OWUzYTM0YmYyM2IyODIyNDYyOGJkYmQ0MDM2MjNkZDVjODMzNjhhNmY2MTI5MWYyYWY0OTMmdXVpZD1jMTA2M2ZlMDFkNDMxMWVkOTI0Y2ZmNmFkNTA2NjFiMg
    ```

4. 在根目录使用命令行运行以下命令

    ``` sh
    npm install
    npm start
    ```

    运行完成后浏览器会自动打开本地服务器URL（如果没有请手动[访问](http://localhost:3000)，默认端口为3000），此时可看到白板应用demo已启动，点击右侧工具栏最后一个按钮打开插件列表，点击其中的`MidiBoard`即可使用本插件~

    ***推荐最大化插件窗口以获得最佳体验**

## 快速入门 & 功能详解 & 基础操作

### 见[完整文档](https://corpdreams.github.io/app-midi-board-docs/#/)

- *文档内包含GIF及图片，为提高加载速度，推荐使用科学上网。*