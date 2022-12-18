import { contextBridge, ipcRenderer } from "electron";
import * as config from "../../lib/config/main";
import { parse, Url } from "url";
import * as youtube from "../../lib/youtube/main";


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
  deletePlaylist(name: string): void
  getYoutubeTitle(url: string): Promise<string>
  openExternal(url: string): void
  editPlaylist(playlsitName: string, playlist: config.Playlist): Promise<void>
  parse(urlString: string, parseQueryString: boolean, slashesDenoteHost?: boolean): Url
}

const api: YoutubeRadioPreload = {
  async getPlaylists(): Promise<config.Playlist[]> {
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
  deletePlaylist(name: string) {
    ipcRenderer.invoke('delete-playlist', name)
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

}
contextBridge.exposeInMainWorld('YoutubeRadio', api)
