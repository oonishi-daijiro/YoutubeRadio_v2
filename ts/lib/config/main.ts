import { app, Config } from "electron";
import electronStore from "electron-store"
import * as diff from "diff";

import * as youtube from "../youtube/main";


export const configFile = new electronStore({
  cwd: app.getPath('userData')
})

export interface youtubeVideoInfo {
  id: string
  title?: string | undefined
}
export interface playlistInfo {
  name: string
  videoList?: YoutubeVideo[]
  ID?: string
  thumbnail?: string
}


export class YoutubeVideo {
  id: string
  title: string
  constructor(videoInfo: youtubeVideoInfo = {
    id: "",
    title: undefined
  }) {
    this.title = videoInfo.title
    this.id = videoInfo.id
  }
}

export interface Playlist {
  name: string
  videoList: YoutubeVideo[]
  upDateVideoList(videoList: YoutubeVideo[]): Promise<void>
  playlistID?: string
  thumbnail?: string
}

export class YoutubePlaylist implements Playlist {
  name: string = ""
  videoList: YoutubeVideo[] = []
  playlistID: string
  thumbnail: string
  constructor(playlistInfo: playlistInfo) {
    this.playlistID = playlistInfo.ID ? playlistInfo.ID : ""
    this.name = playlistInfo.name ? playlistInfo.name : ""
    this.thumbnail = playlistInfo.thumbnail ? playlistInfo.thumbnail : ""
  }
  async upDateVideoList(videoList: YoutubeVideo[]): Promise<void> {
    this.videoList = await createVideoListFromDiff(this.videoList, videoList)
  }
}

export class YoutubeRadioPlaylist implements Playlist {
  name: string
  videoList: YoutubeVideo[]
  thumbnail: string
  constructor(playlistInfo: playlistInfo) {
    this.videoList = playlistInfo.videoList ? playlistInfo.videoList : defaultPlaylist.videoList
    this.name = playlistInfo.name ? playlistInfo.name : ""
    this.thumbnail = playlistInfo.thumbnail ? playlistInfo.thumbnail : ""
  }
  async upDateVideoList(videoList: YoutubeVideo[]): Promise<void> {
    this.videoList = await createVideoListFromDiff(this.videoList, videoList)
  }
}

export async function createVideoListFromDiff(currentVideoList: YoutubeVideo[], newVideoList: YoutubeVideo[]): Promise<YoutubeVideo[]> {
  const currentVideoListID = currentVideoList.map(e => e.id)
  const newVideoListID = newVideoList.map(e => e.id)
  const difference = diff.diffArrays(currentVideoListID, newVideoListID)

  let index = 0

  for (const diffOperation of difference) {
    if (diffOperation.added) {
      for (const _ of diffOperation.value) {
        newVideoList[index].title = await youtube.getTitle(newVideoList[index].id)
        console.log("add")
        currentVideoList.splice(index, 0, newVideoList[index])
        index++
      }
    } else if (diffOperation.removed) {
      diffOperation.value.forEach(() => {
        currentVideoList.splice(index, 1)
      })
    } else {
      diffOperation.value.forEach(() => {
        index++
      })
    }
  }
  return currentVideoList
}

const defaultVideo = new YoutubeVideo()
const defaultPlaylist: Playlist = new YoutubeRadioPlaylist({ name: "", videoList: [defaultVideo], thumbnail: "" })
const defaultPlaylists: Playlist[] = []

export async function createPlaylist(info: playlistInfo): Promise<Playlist> {
  if (info.ID) {
    const playlist = new YoutubePlaylist(info)
    playlist.videoList = await youtube.getAllVideoFromYoutubePlaylistID(playlist.playlistID)
    return playlist
  } else {
    const currentPlaylist = getPlaylist(info.name)
    const playlist = new YoutubeRadioPlaylist(info)
    playlist.videoList = await createVideoListFromDiff(currentPlaylist.videoList, playlist.videoList)
    return playlist
  }
}

export function getPlaylists(): Playlist[] {
  const rawConfig = configFile.get("playlists", defaultPlaylists) as Array<Playlist>
  const playlists = rawConfig.map(e => {
    if (e.playlistID) {
      const pl = new YoutubePlaylist({
        name: e.name,
        ID: e.playlistID
      })
      pl.videoList = e.videoList
      return pl
    } else {
      return new YoutubeRadioPlaylist({
        name: e.name,
        videoList: e.videoList
      })
    }
  })
  return playlists
}

export function getPlaylist(playlistName: string) {
  let playlist = defaultPlaylist
  getPlaylists().forEach(e => {
    if (e.name === playlistName) {
      playlist = e
    }
  })
  return playlist
}


export async function setPlaylist(playlist: Playlist = defaultPlaylist) {
  if (!playlist.name.length || !playlist.videoList.length) {
    return
  }
  const playlists = getPlaylists()
  let isUnique = false
  playlists.forEach((e, index) => {
    if (e.name === playlist.name) {
      playlists[index] = playlist
      isUnique = true
    }
  })
  if (!isUnique) {
    playlists.push(playlist)
  }
  configFile.set('playlists', playlists)
}

export function getVolume(): number {
  const volume = configFile.get('volume', 50) as number
  return volume
}

export function setVolume(volume: number) {
  configFile.set('volume', volume)
}
