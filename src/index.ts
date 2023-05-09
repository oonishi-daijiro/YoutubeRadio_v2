import { ipcMain, app, BrowserWindow, shell } from 'electron';
import { launchServer } from "./lib/server";
import * as config from "./lib/config";
import {
  YoutubeRadioThumbarButtons
} from "./lib/thumbnail-toolber-buttons";
import { playlistNavigation } from './preload/playlist';
import * as youtube from "./lib/youtube";
import * as url from "url";
import * as path from 'path';


app.disableHardwareAcceleration()

let mainWindow: BrowserWindow = null as unknown as BrowserWindow;
let playlistWindow: BrowserWindow = null as unknown as BrowserWindow;

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
        preload: `${__dirname}/preload/player.js`,
        nodeIntegration: false,
        sandbox: true
      },
    }
  )

  // mainWindow.webContents.openDevTools()


  const port = launchServer()

  mainWindow.loadURL(`http://localhost:${port}`)
  mainWindow.setIcon(path.resolve(__dirname, "../icon/icon.ico"))

  const buttons = new YoutubeRadioThumbarButtons(mainWindow)

  const buttonsVideoPlaying = [
    buttons.previousVideo,
    buttons.pause,
    buttons.nextVideo,
  ]
  const buttonsVideoPaused = [
    buttons.previousVideo,
    buttons.play,
    buttons.nextVideo,
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
  // createpl("https://www.youtube.com/playlist?list=PLD9LTsJMicOnQvC7GDgOtOo4Y0jQ0aVex", "YTRPL", false)


})

async function createpl(url: string, name: string, op: boolean) {
  const pl = await config.createPlaylist({
    name: name,
    playlistID: youtube.getPlaylistID(url),
    isShuffle: false,
    type: "youtube",
    videos: []
  })

  if (op) {
    config.setPlaylist(pl)
    return
  }

  const ytrPl = await config.createPlaylist({
    name: name,
    videos: pl.videos,
    isShuffle: false,
    type: "youtube_radio"
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

ipcMain.handle('is-pinned', () => {
  return mainWindow.isAlwaysOnTop()
})

ipcMain.handle('pin-player', () => {
  mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop())
  return mainWindow.isAlwaysOnTop()
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
        preload: `${__dirname}/preload/playlist.js`,
        nodeIntegration: false,
        sandbox: true
      },
    }
  )
  // playlistWindow.webContents.openDevTools()

  ipcMain.handleOnce('ready-to-show-playlist-window', () => {
    playlistWindow.show()
  })

  playlistWindow.loadFile(path.resolve(__dirname, './app/playlist/playlist.html'))
})


ipcMain.handle('close-playlist-window', () => {
  playlistWindow.close()
  playlistWindow = null as unknown as BrowserWindow;
})

ipcMain.handle('load-playlist', (_, name: string) => {
  mainWindow.webContents.send('load-playlist', name)
})

ipcMain.handle('delete-playlist', (_, name: string) => {
  config.deletePlaylist(name)
})

ipcMain.handle('get-youtube-title', (_, id: string) => {
  return youtube.getTitle(id)
})

ipcMain.handle('open-external', (_, youtubeUrl: string) => {
  console.log(youtubeUrl);

  const parsedUrl = url.parse(youtubeUrl)

  if (parsedUrl.host === 'www.youtube.com' && parsedUrl.protocol === 'https:') {
    shell.openExternal(youtubeUrl)
  }
})

ipcMain.handle('edit-playlist', (_, playlistName: string, newPlaylist: config.Playlist) => {
  return config.editPlaylist(playlistName, newPlaylist)
})
