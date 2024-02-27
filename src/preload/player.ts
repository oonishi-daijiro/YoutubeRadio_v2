import { contextBridge, ipcRenderer } from "electron";
import { type Playlist } from "../lib/config";
import type * as config from "../lib/config";
import { type playlistNavigation } from "./playlist";
export default interface YoutubeRadioPreload {
  getPlaylists: () => Promise<Playlist[]>;
  close: () => void;
  minimize: () => void;
  onVideoPlayed: (callback: () => void) => void;
  onVideoPaused: (callback: () => void) => void;
  onNextVideo: (callback: () => void) => void;
  onReqPlayVideo: (callback: () => void) => void;
  onReqPauseVideo: (callback: () => void) => void;
  openSelectPlaylistWindow: () => Promise<void>;
  onReqPreviousVideo: (callback: () => void) => void;
  onLoadPlaylist: (
    callback: (arg: { name: string; index: number }) => Promise<void>
<<<<<<< Updated upstream
  ) => void;
  emitPlayerStartPlaying: () => void;
  onPlayerStartPlaying: () => Promise<any>;
  test: () => void;
  saveVolume: (volume: number) => Promise<void>;
  getVolume: () => Promise<number>;
  emitWindowGetReady: () => void;
  onReqNavigation: (
=======
  ): void;
  // createYoutubeVideo(info: config.YoutubeVideo): Promise<config.YoutubeVideo>;
  emitPlayerStartPlaying(): void;
  onPlayerStartPlaying(): Promise<void>;
  test(): void;
  saveVolume(volume: number): Promise<void>;
  getVolume(): Promise<number>;
  emitWindowGetReady(): void;
  onReqNavigation(
>>>>>>> Stashed changes
    callback: (playlistNavigation: playlistNavigation) => void
  ) => void;
  editPlaylist: (
    name: string,
    newPlaylist: config.PrimitivePlaylist
  ) => Promise<void>;
}

const api: YoutubeRadioPreload = {
  getPlaylists: async (): Promise<Playlist[]> => {
    return await ipcRenderer.invoke("get-playlists");
  },
  minimize() {
    ipcRenderer.invoke("minimize-player");
  },
  close() {
    ipcRenderer.send("close-player");
  },
  onVideoPlayed(callback: () => void) {
    ipcRenderer.on("video-played", callback);
  },
  onVideoPaused(callback: () => void) {
    ipcRenderer.on("video-paused", callback);
  },
  onNextVideo(callback: () => void) {
    ipcRenderer.on("req-next-video", callback);
  },
  onReqPreviousVideo(callback: () => void) {
    ipcRenderer.on("req-previous-video", callback);
  },
  onReqPlayVideo(callback: () => void) {
    ipcRenderer.on("req-play-video", callback);
  },
  onReqPauseVideo(callback: () => void) {
    ipcRenderer.on("req-pause-video", callback);
  },
  openSelectPlaylistWindow: async () => {
    return await ipcRenderer.invoke("open-playlist-window");
  },
  onLoadPlaylist(
    callback: (arg: { name: string; index: number }) => Promise<void>
  ) {
    ipcRenderer.on("load-playlist", (_, arg) => {
      callback(arg);
    });
  },
  emitPlayerStartPlaying(): void {
    ipcRenderer.invoke("player-start-playing");
  },
<<<<<<< Updated upstream
  async onPlayerStartPlaying(): Promise<any> {
    return await new Promise((resolve, reject) => {
=======
  onPlayerStartPlaying(): Promise<void> {
    return new Promise((resolve) => {
>>>>>>> Stashed changes
      ipcRenderer.on("player-start-playing", () => {
        resolve();
      });
    });
  },
  test() {
    ipcRenderer.invoke("test");
  },
  async saveVolume(volume: number): Promise<void> {
    return await ipcRenderer.invoke("save-volume", volume);
  },
  async getVolume(): Promise<number> {
    return await ipcRenderer.invoke("get-volume");
  },
  emitWindowGetReady() {
    ipcRenderer.invoke("ready-to-show-player");
  },
  onReqNavigation(callback) {
    ipcRenderer.on("navigate-playlist", (_, navigation: playlistNavigation) => {
      callback(navigation);
    });
  },
  async editPlaylist(
    name: string,
    newPLaylist: config.PrimitivePlaylist
  ): Promise<void> {
    return await ipcRenderer.invoke("edit-playlist", name, newPLaylist);
  },
};

contextBridge.exposeInMainWorld("YoutubeRadio", api);
