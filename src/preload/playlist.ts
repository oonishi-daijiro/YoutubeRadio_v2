import { contextBridge, ipcRenderer } from "electron";
import * as config from "../lib/config";
import { parse, Url } from "url";
import { parseYoutubeVideoURL } from "../app/playlist/components";

export interface playlistNavigation {
  shuffle: boolean;
}

export interface YoutubeRadioPreload {
  getPlaylists(): Promise<config.Playlist[]>;
  close(): void;
  loadPlaylist(name: string, index: number): void;
  navigatePlaylist(navigation: playlistNavigation): void;
  deletePlaylist(name: string): Promise<void>;
  getYoutubeTitleFromID(url: string): Promise<string>;
  openExternal(url: string): void;
  editPlaylist(
    playlsitName: string,
    playlist: config.PrimitivePlaylist
  ): Promise<void>;
  parse(
    urlString: string,
    parseQueryString: boolean,
    slashesDenoteHost?: boolean
  ): Url;
  pinPlayer(): Promise<boolean>;
  isPinned(): Promise<boolean>;
  savePlaylists(playlists: config.Playlist[]): Promise<void>;
}

const api: YoutubeRadioPreload = {
  async getPlaylists(): Promise<config.Playlist[]> {
    return ipcRenderer.invoke("get-playlists");
  },
  close(): void {
    ipcRenderer.invoke("close-playlist-window");
  },
  loadPlaylist(name: string, index: number): void {
    ipcRenderer.invoke("load-playlist", {
      name: name,
      index: index,
    });
  },
  navigatePlaylist(navigation: playlistNavigation) {
    ipcRenderer.invoke("navigate-playlist", navigation);
  },
  deletePlaylist(name: string): Promise<void> {
    return ipcRenderer.invoke("delete-playlist", name);
  },
  editPlaylist(
    playlsitName: string,
    playlist: config.PrimitivePlaylist
  ): Promise<void> {
    return ipcRenderer.invoke("edit-playlist", playlsitName, playlist);
  },
  getYoutubeTitleFromID(id: string): Promise<string> {
    return ipcRenderer.invoke("get-youtube-title", id);
  },
  openExternal(url: string): void {
    ipcRenderer.invoke("open-external", url);
  },
  parse(urlString, parseQueryString, slashesDenoteHost?): Url {
    return parse(urlString, parseQueryString, slashesDenoteHost);
  },
  pinPlayer(): Promise<boolean> {
    return ipcRenderer.invoke("pin-player");
  },
  isPinned(): Promise<boolean> {
    return ipcRenderer.invoke("is-pinned");
  },
  savePlaylists(playlists: config.Playlist[]): Promise<void> {
    return ipcRenderer.invoke("save-playlists", playlists);
  },
};
contextBridge.exposeInMainWorld("YoutubeRadio", api);
