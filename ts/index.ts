import { ipcMain, app, BrowserWindow, safeStorage } from 'electron';
import { launchServer } from "./lib/server/main";
import * as config from "./lib/config/main";
import {
  YoutubeRadioThumbarButtons
} from "./lib/thumbnailToolbar/main";

import * as youtube from "./lib/youtube/main";

app.disableHardwareAcceleration()


let mainWindow: BrowserWindow=null;
let playlistWindow: BrowserWindow = null;



app.on('ready', () => {
  mainWindow = new BrowserWindow(
    {
      frame: false,
      width: 292,
      height: 240,
      fullscreenable: false,
      maximizable: false,
      resizable: false,
      useContentSize: true,
      show: false,
      webPreferences: {
        contextIsolation: true,
        preload: __dirname + "/preload/player/preload.js",
        nodeIntegration: false,
        sandbox: true
      },
    }
  )

  const port = launchServer()
  mainWindow.loadURL(`http://localhost:${port}`)
  mainWindow.setIcon(__dirname + "/icon/icon.ico")

  mainWindow.webContents.openDevTools()
  const buttons = new YoutubeRadioThumbarButtons(mainWindow)

  const buttonsVideoPlaying = [
    buttons.previousVideo,
    buttons.pause,
    buttons.nextVideo
  ]
  const buttonsVideoPaused = [
    buttons.previousVideo,
    buttons.play,
    buttons.nextVideo
  ]


  ipcMain.handle('ready-to-show', () => {
    mainWindow.show()
    mainWindow.setThumbarButtons(buttonsVideoPlaying)
  })

  mainWindow.webContents.on('media-paused', () => {
    mainWindow.setThumbarButtons(buttonsVideoPaused)
    mainWindow.webContents.send('video-paused')
  })

  mainWindow.webContents.on('media-started-playing', () => {
    mainWindow.setThumbarButtons(buttonsVideoPlaying)
    mainWindow.webContents.send('video-played')
  })

  mainWindow.on('close', () => {
    mainWindow.webContents.removeAllListeners()
  })
}) // end of app on ready

ipcMain.handle('create-youtube-video', (_, info: config.youtubeVideoInfo) => {
  return new config.YoutubeVideo(info)
})

ipcMain.handle('get-playlists', () => {
  return config.getPlaylists()
})

ipcMain.on('close-player', () => {
  mainWindow.close()
  app.exit()
})

ipcMain.handle('minimize-player', () => {
  mainWindow.minimize()
})


ipcMain.handle('player-start-playing', () => {
  mainWindow.webContents.send('player-start-playing')
})

ipcMain.handle('set-playlist', async (_, newPlaylist: config.Playlist) => {
  const currentPlaylist = config.getPlaylist(newPlaylist.name)
  await currentPlaylist.upDateVideoList(newPlaylist.videoList)
  config.setPlaylist(currentPlaylist)
})

ipcMain.handle('save-volume', (_, volume: number = 50) => {
  config.setVolume(volume)
  return
})

ipcMain.handle('get-volume', () => {
  return config.getVolume()
})

ipcMain.on('open-playlist-window', () => {
  playlistWindow = new BrowserWindow(
    {
      frame: false,
      width: 520,
      height: 320,
      fullscreenable: false,
      maximizable: false,
      resizable: false,
      useContentSize: true,
      webPreferences: {
        contextIsolation: true,
        preload: __dirname + "/preload/playlist/preload.js",
        nodeIntegration: false,
        sandbox: true
      },
    }
  )
  playlistWindow.loadFile(__dirname + "/app/playlist/index.html")
  playlistWindow.webContents.openDevTools()
})


ipcMain.handle('close-playlist-window', () => {
  playlistWindow.close()
  playlistWindow=null
})

ipcMain.handle('load-playlist', (_, name: string) => {
  mainWindow.webContents.send('load-playlist', name)
})
