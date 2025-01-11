import { contextBridge, ipcRenderer } from "electron";
import { type PrimitivePlaylist, type Playlist } from "../lib/config";
export default interface YoutubeRadioPreload {
  getPlaylists: () => Promise<Playlist[]>;
  close: () => void;
  minimize: () => void;
  onVideoPlayed: (callback: () => void) => void;
  onVideoPaused: (callback: () => void) => void;
  onNextVideo: (callback: () => void) => void;
  onReqPlayVideo: (callback: () => void) => void;
  onReqPauseVideo: (callback: () => void) => void;
  openSelectPlaylistWindow: (currentPlayingListName: string) => Promise<void>;
  onReqPreviousVideo: (callback: () => void) => void;
  onLoadPlaylist: (
    callback: (arg: { name: string; index: number }) => Promise<void>
  ) => void;
  // createYoutubeVideo(info: config.YoutubeVideo): Promise<config.YoutubeVideo>;
  emitPlayerStartPlaying: () => void;
  onPlayerStartPlaying: () => Promise<any>;
  saveVolume: (volume: number) => Promise<void>;
  getVolume: () => Promise<number>;
  emitWindowGetReady: () => void;
  onSetShuffleCurrentPlaylist: (
    callback: (shuffle: boolean, playlistname: string) => void
  ) => void;
  editPlaylist: (name: string, newPlaylist: PrimitivePlaylist) => Promise<void>;
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
  openSelectPlaylistWindow: async (currentPlayingListName: string) => {
    return await ipcRenderer.invoke(
      "open-playlist-window",
      currentPlayingListName
    );
  },
  onLoadPlaylist(
    callback: (arg: { name: string; index: number }) => Promise<void>
  ) {
    ipcRenderer.on(
      "load-playlist",
      (_, arg: { name: string; index: number }) => {
        callback(arg);
      }
    );
  },
  emitPlayerStartPlaying(): void {
    ipcRenderer.invoke("player-start-playing");
  },
  async onPlayerStartPlaying(): Promise<any> {
    return await new Promise((resolve, reject) => {
      ipcRenderer.on("player-start-playing", () => {
        resolve({});
      });
    });
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
  onSetShuffleCurrentPlaylist(callback) {
    ipcRenderer.on(
      "set-shuffle-current-playlist",
      (_, arg: { shuffle: boolean; playlistname: string }) => {
        callback(arg.shuffle, arg.playlistname);
      }
    );
  },
  async editPlaylist(
    name: string,
    newPLaylist: PrimitivePlaylist
  ): Promise<void> {
    return await ipcRenderer.invoke("edit-playlist", name, newPLaylist);
  },
};

contextBridge.exposeInMainWorld("YoutubeRadio", api);
