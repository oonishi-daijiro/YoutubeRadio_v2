import { contextBridge, ipcRenderer } from "electron";
import * as config from "../../lib/config/main";


export interface playlistNavigation {
  name: string
  index?: number
  shuffle?: boolean

}

export interface YoutubeRadioPreload {
  getPlaylists(): Promise<config.Playlist[]>
  close(): void
  loadPlaylist(index: string): void
  openEditPlaylist(playlistName: string): void
  navigatePlaylist(index: playlistNavigation): void
  deletePlaylist(name: string): void
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
  }

}
contextBridge.exposeInMainWorld('YoutubeRadio', api)
