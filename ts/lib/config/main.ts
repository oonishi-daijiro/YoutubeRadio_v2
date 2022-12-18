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
  isShuffle: boolean
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
  videos: YoutubeVideo[]
  isShuffle: boolean
  playlistID?: string
}

export class YoutubePlaylist implements Playlist {
  name: string = ""
  videos: YoutubeVideo[] = []
  playlistID: string
  thumbnail: string
  isShuffle = false
  constructor(playlistInfo: playlistInfo) {
    this.playlistID = playlistInfo.ID ? playlistInfo.ID : ""
    this.name = playlistInfo.name ? playlistInfo.name : ""
    this.thumbnail = playlistInfo.thumbnail ? playlistInfo.thumbnail : ""
    this.isShuffle = playlistInfo.isShuffle
  }
}

export class YoutubeRadioPlaylist implements Playlist {
  name: string
  videos: YoutubeVideo[]
  thumbnail: string
  isShuffle = false
  constructor(playlistInfo: playlistInfo) {
    this.videos = playlistInfo.videoList ? playlistInfo.videoList : defaultPlaylist.videos
    this.name = playlistInfo.name ? playlistInfo.name : ""
    this.thumbnail = playlistInfo.thumbnail ? playlistInfo.thumbnail : ""
    this.isShuffle = playlistInfo.isShuffle
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
        console.log("remove");

        currentVideoList.splice(index, 1)
      })
    } else {
      console.log("noop");

      diffOperation.value.forEach(() => {
        index++
      })
    }
  }
  return currentVideoList
}

const defaultVideo = new YoutubeVideo()
const defaultPlaylist: Playlist = new YoutubeRadioPlaylist(
  {
    name: "",
    videoList: [defaultVideo],
    thumbnail: "",
    isShuffle: false
  })
const defaultPlaylists: Playlist[] = []

export async function createPlaylist(info: playlistInfo): Promise<Playlist> {
  if (info.ID) {
    const playlist = new YoutubePlaylist(info)
    playlist.videos = await youtube.getAllVideoFromYoutubePlaylistID(playlist.playlistID)
    return playlist
  } else {
    const currentPlaylist = getPlaylist(info.name)
    const playlist = new YoutubeRadioPlaylist(info)
    playlist.videos = await createVideoListFromDiff(currentPlaylist.videos, playlist.videos)
    return playlist
  }
}

export function getPlaylists(): Playlist[] {
  const rawConfig = configFile.get("playlists", defaultPlaylists) as Array<Playlist>
  const playlists = rawConfig.map(e => {
    if (e.playlistID) {
      const pl = new YoutubePlaylist({
        name: e.name,
        ID: e.playlistID,
        isShuffle: e.isShuffle
      })
      pl.videos = e.videos
      return pl
    } else {
      return new YoutubeRadioPlaylist({
        name: e.name,
        videoList: e.videos,
        isShuffle: e.isShuffle
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
  if (!playlist.name.length || !playlist.videos.length) {
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

export function isAlreadyExistPlaylist(name: string): boolean {
  return getPlaylists().map(e => e.name).includes(name)
}

export function getVolume(): number {
  const volume = configFile.get('volume', 50) as number
  return volume
}

export function setVolume(volume: number) {
  configFile.set('volume', volume)
}

export function deletePlaylist(name: string) {
  let index = -1
  const playlists = getPlaylists()
  playlists.forEach((playlist: Playlist, i: number) => {
    if (playlist.name === name) {
      index = i
    }
  })
  if (index != -1) {
    playlists.splice(index, 1)
    configFile.set('playlists', playlists)
  }
}

export async function editPlaylist(playlistName: string, newPlaylist: Playlist) {
  const playlists = getPlaylists()
  await Promise.all(playlists.map(async (playlist, index) => {
    if (playlist.name === playlistName) {
      playlist.name = newPlaylist.name
      playlist.isShuffle = newPlaylist.isShuffle

      if (playlist.playlistID && playlist.playlistID !== newPlaylist.playlistID) {
        playlist.videos = await youtube.getAllVideoFromYoutubePlaylistID(newPlaylist.playlistID)
        playlist.playlistID = newPlaylist.playlistID
      } else {
        playlist.videos = await createVideoListFromDiff(playlist.videos, newPlaylist.videos)
      }

      playlists[index] = playlist
    }
  }))
  configFile.set('playlists', playlists)
}
