import { contextBridge, ipcRenderer } from "electron";
import type * as config from "../lib/config";

export interface playlistNavigation {
  shuffle: boolean;
}

export interface YoutubeRadioPreload {
  getPlaylists: () => Promise<config.Playlist[]>;
  close: () => void;
  loadPlaylist: (name: string, index: number) => void;
  navigatePlaylist: (navigation: playlistNavigation) => void;
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
}

const api: YoutubeRadioPreload = {
  async getPlaylists(): Promise<config.Playlist[]> {
    // await new Promise<void>((resolve) => setTimeout(resolve, 1000));
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
  navigatePlaylist(navigation: playlistNavigation) {
    ipcRenderer.invoke("navigate-playlist", navigation);
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
};
contextBridge.exposeInMainWorld("YoutubeRadio", api);
