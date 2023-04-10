import { contextBridge, ipcRenderer } from "electron";
import { Playlist } from "../lib/config";
import * as config from "../lib/config";
import { playlistNavigation } from "./playlist";
export default interface YoutubeRadioPreload {
  getPlaylists(): Promise<Playlist[]>
  close(): void
  minimize(): void
  onVideoPlayed(callback: () => void): void
  onVideoPaused(callback: () => void): void
  onNextVideo(callback: () => void): void
  onReqPlayVideo(callback: () => void): void
  onReqPauseVideo(callback: () => void): void
  openSelectPlaylistWindow(): void
  onReqPreviousVideo(callback: () => void): void
  onLoadPlaylist(callback: (playlistName: string) => Promise<void>): void
  createYoutubeVideo(info: config.youtubeVideoInfo): Promise<config.YoutubeVideo>
  emitPlayerStartPlaying(): void
  onPlayerStartPlaying(): Promise<any>
  test(): void
  saveVolume(volume: number): Promise<void>
  getVolume(): Promise<number>
  emitWindowGetReady(): void
  onReqNavigation(callback: (playlistNavigation: playlistNavigation) => void): void
  editPlaylist(name: string, newPlaylist: config.Playlist): Promise<void>
}



const api: YoutubeRadioPreload = {
  getPlaylists: async (): Promise<Playlist[]> => {
    return ipcRenderer.invoke('get-playlists')
  },
  minimize() {
    ipcRenderer.invoke('minimize-player')
  },
  close() {
    ipcRenderer.send('close-player')
  },
  onVideoPlayed(callback: () => void) {
    ipcRenderer.on('video-played', callback)
  },
  onVideoPaused(callback: () => void) {
    ipcRenderer.on('video-paused', callback)
  },
  onNextVideo(callback: () => void) {
    ipcRenderer.on('req-next-video', callback)
  },
  onReqPreviousVideo(callback: () => void) {
    ipcRenderer.on('req-previous-video', callback)
  },
  onReqPlayVideo(callback: () => void) {
    ipcRenderer.on('req-play-video', callback)
  },
  onReqPauseVideo(callback: () => void) {
    ipcRenderer.on('req-pause-video', callback)
  },
  openSelectPlaylistWindow: () => {
    ipcRenderer.send('open-playlist-window')
  },
  onLoadPlaylist(callback: (playlistName: string) => Promise<void>) {
    ipcRenderer.on('load-playlist', (_, arg) => {
      callback(arg)
    })
  },
  async createYoutubeVideo(info): Promise<config.YoutubeVideo> {
    return ipcRenderer.invoke('create-youtube-video', info)
  },
  emitPlayerStartPlaying(): void {
    ipcRenderer.invoke('player-start-playing')
  },
  onPlayerStartPlaying(): Promise<any> {
    return new Promise((resolve, reject) => {
      ipcRenderer.on('player-start-playing', () => {
        resolve({})
      })
    })
  },
  test() {
    ipcRenderer.invoke('test')
  },
  saveVolume(volume: number): Promise<void> {
    return ipcRenderer.invoke('save-volume', volume)
  },
  getVolume(): Promise<number> {
    return ipcRenderer.invoke('get-volume')
  },
  emitWindowGetReady() {
    ipcRenderer.invoke('ready-to-show-player')
  },
  onReqNavigation(callback) {
    ipcRenderer.on('navigate-playlist', (_, navigation: playlistNavigation) => {
      callback(navigation)
    });
  },
  editPlaylist(name: string, newPLaylist: config.Playlist): Promise<void> {
    return ipcRenderer.invoke('edit-playlist', name, newPLaylist)
  },

}

contextBridge.exposeInMainWorld("YoutubeRadio", api)