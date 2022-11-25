import { ipcMain, app, BrowserWindow, safeStorage, shell } from 'electron';
import { launchServer } from "./lib/server/main";
import * as config from "./lib/config/main";
import {
  YoutubeRadioThumbarButtons
} from "./lib/thumbnailToolbar/main";
import { playlistNavigation } from './preload/playlist/preload';
import * as youtube from "./lib/youtube/main";
import * as url from "url";



app.disableHardwareAcceleration()


let mainWindow: BrowserWindow = null;
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


  ipcMain.handle('ready-to-show-player', () => {
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
  hoge("https://www.youtube.com/playlist?list=PLD9LTsJMicOlfRa7ePti9HhLRrMDjQ4L0", "YTRPL-Vocaloid")
}) // end of app on ready

async function hoge(url: string, name: string) {
  const pl = await config.createPlaylist({
    name: name,
    ID: youtube.getPlaylistID(url),
    isShuffle: false
  })

  const ytrPl = await config.createPlaylist({
    name: name,
    videoList: pl.videoList,
    isShuffle: false
  })
  config.setPlaylist(ytrPl)
}

ipcMain.handle('create-youtube-video', (_, info: config.youtubeVideoInfo) => {
  return new config.YoutubeVideo(info)
})

ipcMain.handle('navigate-playlist', (_, navigation: playlistNavigation) => {
  mainWindow.webContents.send('navigate-playlist', navigation)
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
  currentPlaylist.isShuffle = newPlaylist.isShuffle
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
      height: 350,
      fullscreenable: false,
      maximizable: false,
      resizable: false,
      useContentSize: true,
      modal: true,
      show: false,
      parent: mainWindow,
      webPreferences: {
        contextIsolation: true,
        preload: __dirname + "/preload/playlist/preload.js",
        nodeIntegration: false,
        sandbox: true
      },
    }
  )
  ipcMain.handleOnce('ready-to-show-playlist-window', () => {
    playlistWindow.show()
  })
  playlistWindow.loadFile(__dirname + "/app/playlist/index.html")
  playlistWindow.webContents.openDevTools()
})


ipcMain.handle('close-playlist-window', () => {
  playlistWindow.close()
  playlistWindow = null
})

ipcMain.handle('load-playlist', (_, name: string) => {
  mainWindow.webContents.send('load-playlist', name)
})

ipcMain.handle('delete-playlist', (_, name: string) => {
  config.deletePlaylist(name)
})

ipcMain.handle('get-youtube-title', async (_, url: string) => {
  return await youtube.getTitle(youtube.getID(url))
})

ipcMain.handle('open-external', (_, youtubeUrl: string) => {
  const parsedUrl = url.parse(youtubeUrl)
  if (parsedUrl.host === 'youtube.com' && parsedUrl.protocol === 'https:') {
    shell.openExternal(youtubeUrl)
  }
})
