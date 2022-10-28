import { contextBridge, ipcRenderer } from "electron";
import * as config from "../../lib/config/main";


export interface playlistNavigation {
  name: string
  index?: number
}

export interface YoutubeRadioPreload {
  emitWindowGetReady():void
  getPlaylists(): Promise<config.Playlist[]>
  close(): void
  loadPlaylist(name: string): void
  openEditPlaylist(playlistName: string): void
  navigatePlaylist(index: playlistNavigation): void
  deletePlaylist(name: string): void
  setPlaylist(playlist:config.Playlist):Promise<void>
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
  emitWindowGetReady(): void{
    ipcRenderer.invoke('ready-to-show-playlist-window')
  },
  setPlaylist(playlist: config.Playlist): Promise<void>{
    console.log(playlist);
    
    return ipcRenderer.invoke('set-playlist',playlist)
  }

}
contextBridge.exposeInMainWorld('YoutubeRadio', api)
