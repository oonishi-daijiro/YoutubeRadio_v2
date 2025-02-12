import { contextBridge, ipcRenderer } from "electron";
import type * as config from "../lib/config";

export interface playlistNavigation {
  shuffle: boolean;
}

export interface YoutubeRadioPreload {
  getPlaylists: () => Promise<config.Playlist[]>;
  close: () => void;
  loadPlaylist: (name: string, index: number) => void;
  setCurrentPlaylistShuffle: (shuffle: boolean, playlistname: string) => void;
  deletePlaylist: (name: string) => Promise<void>;
  getYoutubeTitleFromID: (url: string) => Promise<string>;
  openExternal: (url: string) => void;
  editPlaylist: (
    playlsitName: string,
    playlist: config.PrimitivePlaylist
  ) => Promise<void>;
  pinPlayer: () => Promise<boolean>;
  isPinned: () => Promise<boolean>;
  savePlaylists: (playlists: config.PrimitivePlaylist[]) => Promise<void>;
  getCurrentPlayingListName: () => Promise<string>;
}

const api: YoutubeRadioPreload = {
  async getPlaylists(): Promise<config.Playlist[]> {
    return await ipcRenderer.invoke("get-playlists");
  },
  close(): void {
    ipcRenderer.invoke("close-playlist-window");
  },
  loadPlaylist(name: string, index: number): void {
    ipcRenderer.invoke("load-playlist", {
      name,
      index,
    });
  },
  setCurrentPlaylistShuffle(s: boolean, plname: string) {
    ipcRenderer.invoke("set-shuffle-current-playlist", {
      playlistname: plname,
      shuffle: s,
    });
  },
  async deletePlaylist(name: string): Promise<void> {
    return await ipcRenderer.invoke("delete-playlist", name);
  },
  async editPlaylist(
    playlsitName: string,
    playlist: config.PrimitivePlaylist
  ): Promise<void> {
    return await ipcRenderer.invoke("edit-playlist", playlsitName, playlist);
  },
  async getYoutubeTitleFromID(id: string): Promise<string> {
    return await ipcRenderer.invoke("get-youtube-title", id);
  },
  openExternal(url: string): void {
    ipcRenderer.invoke("open-external", url);
  },
  // parse (urlString, parseQueryString, slashesDenoteHost?): Url {
  //   return parse(urlString, parseQueryString, slashesDenoteHost)
  // },
  async pinPlayer(): Promise<boolean> {
    return await ipcRenderer.invoke("pin-player");
  },
  async isPinned(): Promise<boolean> {
    return await ipcRenderer.invoke("is-pinned");
  },
  async savePlaylists(playlists: config.PrimitivePlaylist[]): Promise<void> {
    return await ipcRenderer.invoke("save-playlists", playlists);
  },
  async getCurrentPlayingListName() {
    return await new Promise<string>((resolve) => {
      ipcRenderer.once("current-playing-list-name", (_, name: string) => {
        resolve(name);
      });
    });
  },
};
contextBridge.exposeInMainWorld("YoutubeRadio", api);
