import { app } from "electron";
import * as electronStore from "electron-store"
import * as diff from "diff";

import * as youtube from "../youtube";

export type playlistTypes = 'youtube' | 'youtube_radio';

export const configFile = new electronStore({
  cwd: app.getPath('userData')
})

export interface youtubeVideoInfo {
  id: string
  title?: string | undefined
}

export interface YoutubeVideo {
  id: string
  title: string
}

export class YoutubeVideo implements YoutubeVideo {
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
  type: playlistTypes
  name: string
  videos: YoutubeVideo[]
  isShuffle: boolean
  playlistID?: string
}

export class YoutubePlaylist implements Playlist {
  name: string
  videos: YoutubeVideo[]
  playlistID: string
  isShuffle
  type: playlistTypes

  constructor(playlistInfo: Playlist) {
    this.videos = playlistInfo.videos.length === 0 ? [] : playlistInfo.videos
    this.playlistID = playlistInfo.playlistID ? playlistInfo.playlistID : ""
    this.name = playlistInfo.name ? playlistInfo.name : ""
    this.isShuffle = playlistInfo.isShuffle
    this.type = "youtube"
  }
}

export class YoutubeRadioPlaylist implements Playlist {
  name: string
  videos: YoutubeVideo[]
  isShuffle = false
  type: playlistTypes
  constructor(playlistInfo: Playlist) {
    this.videos = playlistInfo.videos ? playlistInfo.videos : defaultPlaylist.videos
    this.name = playlistInfo.name ? playlistInfo.name : ""
    this.isShuffle = playlistInfo.isShuffle
    this.type = "youtube_radio"
  }
}



export async function createVideoListFromDiff(currentVideoList: YoutubeVideo[], newVideoList: YoutubeVideo[]): Promise<YoutubeVideo[]> {
  const currentVideoListID = currentVideoList.map(e => e.id)
  const newVideoListID = newVideoList.map(e => e.id)
  const difference = diff.diffArrays(currentVideoListID, newVideoListID)
  let index = 0
  console.log("called");


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
    videos: [defaultVideo],
    isShuffle: false,
    type: "youtube_radio"
  })
const defaultPlaylists: Playlist[] = []

export async function createPlaylist(info: Playlist): Promise<Playlist> {
  if (info.type === 'youtube') {
    const playlist = new YoutubePlaylist(info)
    playlist.videos = await youtube.getAllVideoFromYoutubePlaylistID(playlist.playlistID)
    return playlist
  } else if (info.type === 'youtube_radio') {
    const currentPlaylist = getPlaylist(info.name)
    const playlist = new YoutubeRadioPlaylist(info)
    playlist.videos = await createVideoListFromDiff(currentPlaylist.videos, playlist.videos)
    return playlist
  }
}

export function getPlaylists(): Playlist[] {
  const rawConfig = configFile.get("playlists", defaultPlaylists) as Array<Playlist>
  const playlists = rawConfig
    .filter(pl => {
      return pl.videos.length > 0
    }).map(pl => {
      if (pl.type === 'youtube') {
        return new YoutubePlaylist({ ...pl })
      } else if (pl.type === 'youtube_radio') {
        return new YoutubeRadioPlaylist({ ...pl })
      } else {
        return defaultPlaylist
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

async function updatePlaylist(oldPlaylist: Playlist, newPlaylist: Playlist): Promise<Playlist> {
  oldPlaylist.name = newPlaylist.name
  oldPlaylist.isShuffle = newPlaylist.isShuffle

  if (oldPlaylist.type === "youtube") {
    if (oldPlaylist.playlistID !== newPlaylist.playlistID) {
      oldPlaylist.videos = await youtube.getAllVideoFromYoutubePlaylistID(newPlaylist.playlistID)
      oldPlaylist.playlistID = newPlaylist.playlistID
    } else {
      oldPlaylist.videos = await createVideoListFromDiff(oldPlaylist.videos, newPlaylist.videos)
    }
  } else if (oldPlaylist.type === "youtube_radio") {
    oldPlaylist.videos = await createVideoListFromDiff(oldPlaylist.videos, newPlaylist.videos)
  }
  return oldPlaylist
}

export async function editPlaylist(playlistName: string, newPlaylist: Playlist) {
  const playlists = getPlaylists()
  let isUnique = false
  await Promise.all(playlists.map(async (playlist, index) => {
    if (playlist.name === playlistName) {
      isUnique = true
      playlists[index] = await updatePlaylist(playlist, newPlaylist)
    }
  }))
  if (!isUnique) {
    playlists.push(await createPlaylist(newPlaylist))
  }
  configFile.set('playlists', playlists)
}


export function setPlaylists(playlists: Playlist[]) {
  configFile.set('playlists', playlists)
}
