import { contextBridge, ipcRenderer } from "electron";
import * as config from "../../lib/config/main";

export default interface YoutubeRadioPreload {
  getPlaylists(): Promise<config.Playlist[]>
  close(): void
  loadPlaylist(index: string): void
  openEditPlaylist(playlistName: string): void
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
  }
}
contextBridge.exposeInMainWorld('YoutubeRadio', api)
