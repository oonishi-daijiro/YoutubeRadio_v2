import { ipcMain, app, BrowserWindow, shell, session } from "electron";
import { launchServer } from "./lib/server";
import * as config from "./lib/config";
import { YoutubeRadioThumbarButtons } from "./lib/thumbnail-toolber-buttons";
import { playlistNavigation } from "./preload/playlist";
import * as youtube from "./lib/youtube";
import * as url from "url";
import * as path from "path";

// app.disableHardwareAcceleration()

let mainWindow: BrowserWindow = null as unknown as BrowserWindow;
let playlistWindow: BrowserWindow = null as unknown as BrowserWindow;

const port = launchServer();

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    frame: false,
    width: 292,
    height: 240,
    fullscreenable: false,
    maximizable: false,
    resizable: false,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      preload: `${__dirname}/preload/player.js`,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL(`http://localhost:${port}`);
  mainWindow.setIcon(path.resolve(__dirname, "../icon/icon.ico"));

  const buttons = new YoutubeRadioThumbarButtons(mainWindow);

  const buttonsVideoPlaying = [
    buttons.previousVideo,
    buttons.pause,
    buttons.nextVideo,
  ];
  const buttonsVideoPaused = [
    buttons.previousVideo,
    buttons.play,
    buttons.nextVideo,
  ];

  ipcMain.handle("ready-to-show-player", () => {
    mainWindow.show();
  });
  mainWindow.setThumbarButtons(buttonsVideoPlaying);

  mainWindow.webContents.on("media-paused", () => {
    mainWindow.setThumbarButtons(buttonsVideoPaused);

    mainWindow.webContents.send("video-paused");
  });

  mainWindow.webContents.on("media-started-playing", () => {
    mainWindow.setThumbarButtons(buttonsVideoPlaying);
    mainWindow.webContents.send("video-played");
  });

  mainWindow.on("close", () => {
    mainWindow.webContents.removeAllListeners();
  });
});

ipcMain.handle("navigate-playlist", (_, navigation: playlistNavigation) => {
  mainWindow.webContents.send("navigate-playlist", navigation);
});

ipcMain.handle("get-playlists", () => {
  const pl = config.YoutubeRadioConfig.getAllPlaylists();
  return pl;
});

ipcMain.on("close-player", () => {
  mainWindow.close();
  app.exit();
});

ipcMain.handle("minimize-player", () => {
  mainWindow.minimize();
});

ipcMain.handle("player-start-playing", () => {
  mainWindow.webContents.send("player-start-playing");
});

ipcMain.handle(
  "set-playlist",
  async (_, newPlaylist: config.PrimitivePlaylist) => {
    const currentPlaylist = config.YoutubeRadioConfig.getPlaylist(
      newPlaylist.name
    );
    currentPlaylist.isShuffle = newPlaylist.isShuffle;
    config.YoutubeRadioConfig.setPlaylist(currentPlaylist);
  }
);

ipcMain.handle("save-volume", (_, volume: number = 50) => {
  config.YoutubeRadioConfig.setVolume(volume);
  return;
});

ipcMain.handle("get-volume", () => {
  return config.YoutubeRadioConfig.getVolume();
});

ipcMain.handle("is-pinned", () => {
  return mainWindow.isAlwaysOnTop();
});

ipcMain.handle("pin-player", () => {
  mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop());
  return mainWindow.isAlwaysOnTop();
});

ipcMain.handle("open-playlist-window", () => {
  playlistWindow = new BrowserWindow({
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
      sandbox: true,
    },
  });
  playlistWindow.loadFile(
    path.resolve(__dirname, "./app/playlist/playlist.html")
  );
  playlistWindow.once("ready-to-show", () => {
    playlistWindow.show();
  });
});

ipcMain.handle("close-playlist-window", () => {
  // playlistWindow.reload();

  playlistWindow.close();
  playlistWindow = null as unknown as BrowserWindow;
});

ipcMain.handle("load-playlist", (_, arg: { name: string; index: number }) => {
  mainWindow.webContents.send("load-playlist", arg);
});

ipcMain.handle("delete-playlist", (_, name: string) => {
  config.YoutubeRadioConfig.deletePlaylist(name);
});

ipcMain.handle("get-youtube-title", (_, id: string) => {
  return youtube.getTitle(id);
});

ipcMain.handle("open-external", (_, youtubeUrl: string) => {
  const parsedUrl = url.parse(youtubeUrl);

  if (parsedUrl.host === "www.youtube.com" && parsedUrl.protocol === "https:") {
    shell.openExternal(youtubeUrl);
  }
});

ipcMain.handle(
  "edit-playlist",
  (_, playlistName: string, newPlaylist: config.PrimitivePlaylist) => {
    return config.YoutubeRadioConfig.editPlaylistAndSave(
      playlistName,
      newPlaylist
    );
  }
);
