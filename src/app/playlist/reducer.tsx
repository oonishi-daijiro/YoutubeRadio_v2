import * as React from "react"
import { Playlist, YoutubePlaylist } from "../../lib/config";
import { playlistNavigation, YoutubeRadioPreload } from "../../preload/playlist";
import { PlaylistDetailDisplay, PlaylistEditorDisplay, PlaylistsDisplay } from "./components"
import { sPlaylists } from "./main";

interface preload extends Window {
  YoutubeRadio: YoutubeRadioPreload
}
export declare const window: preload


export const Displays = {
  'playlists': (index: number) => <PlaylistsDisplay index={index} />,
  'playlist-detail': (index: number) => <PlaylistDetailDisplay index={index} />,
  'playlist-editor': (index: number) => <PlaylistEditorDisplay index={index} />
} as const


export const animationNames = [
  'fade-out-to-right',
  'fade-out-to-left',
  'fade-in-from-left',
  'fade-in-from-right',
  'fade-away',
  ''
] as const

export interface AppState {
  isPlaylistsLoaded: boolean
  playlists: Playlist[]
  displays: (keyof typeof Displays)[]
  targetPlaylist: Playlist
  switchAnimationHook: typeof animationNames[number][]
  isAnimating: boolean
}

export const DefaultAppState: AppState = {
  isPlaylistsLoaded: false,
  playlists: [],
  displays: ['playlists'],
  targetPlaylist: {
    name: '',
    type: 'youtube',
    videos: [],
    isShuffle: false
  },
  switchAnimationHook: [''],
  isAnimating: false
}


export interface ReducerActions {
  'set-target-playlist': {
    type: 'set-target-playlist',
    props: Playlist
  }
  'push-display': {
    type: 'push-display',
    props: keyof typeof Displays
  }
  'pop-display': {
    type: 'pop-display'
  }
  'delete-playlist': {
    type: 'delete-playlist',
    props: string
  }
  'edit-target-playlist': {
    type: 'edit-target-playlist',
    props: Playlist
  }
  'close-window': {
    type: 'close-window'
  }
  'navigate-playlist': {
    type: 'navigate-playlist',
    props: playlistNavigation
  }
  'animate': {
    type: 'animate',
    props: 'pop' | 'push' | 'reload'
  }
  'animation-end': {
    type: 'animation-end'
  }
  'load-playlists': {
    type: 'load-playlists',
    props: Playlist[]
  }
  'reload-playlists': {
    type: 'reload-playlists',
  }
  'reload': {
    type: 'reload'
  }
  
}



export function Reducer(currentAppState: AppState, action: ReducerActions[keyof ReducerActions]): AppState {
  if (currentAppState === null) {
    return DefaultAppState
  }

  switch (action.type) {

    case 'push-display':
      currentAppState.displays.push(action.props)
      return {
        ...currentAppState,
        displays: [...currentAppState.displays],
      }

    case 'pop-display':
      currentAppState.displays.pop()
      currentAppState.switchAnimationHook.pop()
      return {
        ...currentAppState,
        displays: [...currentAppState.displays]
      }

    case 'set-target-playlist':
      return {
        ...currentAppState,
        targetPlaylist: action.props
      }

    case 'delete-playlist':
      window.YoutubeRadio.deletePlaylist(action.props)
      const index = currentAppState.playlists.findIndex(pl => pl.name === action.props)
      currentAppState.playlists.splice(index, 1)

      return {
        ...currentAppState,
        playlists: currentAppState.playlists
      }

    case 'edit-target-playlist':
      window.YoutubeRadio.editPlaylist(currentAppState.targetPlaylist.name, action.props)
      currentAppState.playlists[currentAppState.playlists.findIndex(pl => pl.name === action.props.name)] = action.props
      return {
        ...currentAppState,
        playlists: [...currentAppState.playlists],
        targetPlaylist: action.props,
      }

    case 'navigate-playlist':
      window.YoutubeRadio.navigatePlaylist(action.props)
      return {
        ...currentAppState
      }

    case 'animate':
      let animationHook = []
      switch (action.props) {
        case 'pop':
          currentAppState.switchAnimationHook[currentAppState.switchAnimationHook.length - 1] = 'fade-out-to-right'
          currentAppState.switchAnimationHook[currentAppState.switchAnimationHook.length - 2] = 'fade-in-from-left'
          animationHook = currentAppState.switchAnimationHook
          return {
            ...currentAppState,
            isAnimating: true,
            switchAnimationHook: [...animationHook]
          }

        case 'push':
          animationHook = currentAppState.switchAnimationHook.fill('fade-out-to-left')
          animationHook.push('fade-in-from-right')
          return {
            ...currentAppState,
            isAnimating: true,
            switchAnimationHook: [...animationHook]
          }
        case 'reload':
          return {
            ...currentAppState,
            displays: ['playlists', currentAppState.displays[currentAppState.displays.length - 1]],
            switchAnimationHook: ['fade-in-from-left', 'fade-out-to-right']
          }
      }

    case 'close-window':
      window.YoutubeRadio.close()
      return { ...currentAppState }

    case 'animation-end':
      return {
        ...currentAppState,
        isAnimating: false
      }

    case 'load-playlists':
      return {
        ...currentAppState,
        isPlaylistsLoaded: true,
        playlists: [...action.props]
      }

    case 'reload-playlists':
      sPlaylists.reLoad()
      return {
        ...currentAppState,
        isPlaylistsLoaded: false,
        displays: ['playlists'],
        switchAnimationHook: ['']
      }
  }
}
