import { contextBridge, ipcRenderer } from "electron";
import * as config from "../lib/config";
import { parse, Url } from "url";


export interface playlistNavigation {
  name: string
  index?: number
  shuffle: boolean
}

export interface YoutubeRadioPreload {
  emitWindowGetReady(): void
  getPlaylists(): Promise<config.Playlist[]>
  close(): void
  loadPlaylist(name: string): void
  openEditPlaylist(playlistName: string): void
  navigatePlaylist(navigation: playlistNavigation): void
  deletePlaylist(name: string): Promise<void>
  getYoutubeTitle(url: string): Promise<string>
  openExternal(url: string): void
  editPlaylist(playlsitName: string, playlist: config.Playlist): Promise<void>
  parse(urlString: string, parseQueryString: boolean, slashesDenoteHost?: boolean): Url
  pinPlayer(): Promise<boolean>
  isPinned(): Promise<boolean>
  savePlaylists(playlists: config.Playlist[]): Promise<void>
}

async function sleep(duration: number) {
  return await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({})
    }, duration);
  })
}

const api: YoutubeRadioPreload = {
  async getPlaylists(): Promise<config.Playlist[]> {
    // await sleep(3000)
    return ipcRenderer.invoke('get-playlists')
  },
  close(): void {
    ipcRenderer.invoke('close-playlist-window')
  },
  loadPlaylist(index: string): void {
    ipcRenderer.invoke('load-playlist', index)
  },
  openEditPlaylist(playlistName: string): void {
    ipcRenderer.send('open-edit-playlist', playlistName)
  },
  navigatePlaylist(navigation: playlistNavigation) {
    ipcRenderer.invoke('navigate-playlist', navigation)
  },
  deletePlaylist(name: string): Promise<void> {
    return ipcRenderer.invoke('delete-playlist', name)
  },
  emitWindowGetReady(): void {
    ipcRenderer.invoke('ready-to-show-playlist-window')
  },
  editPlaylist(playlsitName: string, playlist: config.Playlist): Promise<void> {
    return ipcRenderer.invoke('edit-playlist', playlsitName, playlist)
  },
  getYoutubeTitle(url: string): Promise<string> {
    return ipcRenderer.invoke('get-youtube-title', url)
  },
  openExternal(url: string): void {
    ipcRenderer.invoke('open-external', url)
  },
  parse(urlString, parseQueryString, slashesDenoteHost?): Url {
    return parse(urlString, parseQueryString, slashesDenoteHost)
  },
  pinPlayer(): Promise<boolean> {
    return ipcRenderer.invoke('pin-player')
  },
  isPinned(): Promise<boolean> {
    return ipcRenderer.invoke('is-pinned')
  },
  savePlaylists(playlists: config.Playlist[]): Promise<void> {
    return ipcRenderer.invoke('save-playlists', playlists)
  }
}
contextBridge.exposeInMainWorld('YoutubeRadio', api)