import { contextBridge, ipcRenderer } from "electron";
import * as config from "../../lib/config/main";
import { parse } from "url";
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
  setPlaylist(playlist: config.Playlist): Promise<void>
  getYoutubeTitle(url: string): Promise<string>
  openExternal(url: string): void
  savePlaylist(playlist: config.Playlist): Promise<void>
  getPlaylistIDFromURL(youtubeURL: string): string
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
  setPlaylist(playlist: config.Playlist): Promise<void> {
    console.log(playlist);

    return ipcRenderer.invoke('set-playlist', playlist)
  },
  getYoutubeTitle(url: string): Promise<string> {
    return ipcRenderer.invoke('get-youtube-title', url)
  },
  openExternal(url: string): void {
    ipcRenderer.invoke('open-external', url)
  },
  savePlaylist(playlist: config.Playlist): Promise<void> {
    return ipcRenderer.invoke('save-playlist', playlist)
  },
  getPlaylistIDFromURL(youtubeURL: string): string {
    return parse(youtubeURL, true).query.list as string
  },

}
contextBridge.exposeInMainWorld('YoutubeRadio', api)
