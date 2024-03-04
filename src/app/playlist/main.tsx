import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { type ReducerActions, Reducer, type AppState, DefaultAppState } from './reducer'
import { type YoutubeRadioPreload } from '../../preload/playlist'
import { type Playlist } from '../../lib/config'
import { Displays, FallbackReloadPlaylist } from './components'

export interface preload extends Window {
  YoutubeRadio: YoutubeRadioPreload
}

declare const window: preload

class SuspenseResource<T> {
  constructor(resourceFetcher: () => Promise<T>, defaultData: T) {
    this.resouseFetcher = resourceFetcher
    this.data = defaultData
    this.promise = new Promise<void>((resolve) => { resolve() });
    this.setFetcher()
  }

  read(): T {
    switch (this.stat) {
      case 'pending':
        console.log("pending");
        throw this.promise as unknown as Error
      case 'fullfilled':
        console.log("fullfilled");
        return this.data
      case 'rejected':
        return this.data
    }
  }

  reload(): void {
    console.log('set stat to pending');
    this.stat = 'pending'
    this.setFetcher()
  }

  private setFetcher(): void {
    this.promise = this.resouseFetcher().then(data => {
      this.data = data
      this.stat = 'fullfilled'
    }).catch(() => {
      this.stat = 'rejected'
    })
  }

  private stat: 'pending' | 'fullfilled' | 'rejected' = 'pending'
  private data: T
  private readonly resouseFetcher: () => Promise<T>
  private promise: Promise<void>
}
const domAppRoot = document.getElementById('root')
const AppRoot = ReactDOM.createRoot(domAppRoot!)

export const ContextDispatchAppState = React.createContext<(ReducerAction: ReducerActions[keyof ReducerActions]) => void>(() => { console.log('reducer is not ready') })

export const ContextAppState = React.createContext<AppState>(DefaultAppState)

export const sPlaylists = new SuspenseResource<Playlist[]>(window.YoutubeRadio.getPlaylists, [])

export type dispathFunc = (ReducerAction: ReducerActions[keyof ReducerActions]) => void

const App: React.FC = () => {
  const [appState, dispatchAppState] = React.useReducer(Reducer, DefaultAppState)

  return (
    <ContextAppState.Provider value={appState}>
      <ContextDispatchAppState.Provider value={dispatchAppState}>
        <React.Suspense fallback={<FallbackReloadPlaylist />}>
          <PlaylistLoadSuspenser>
            {appState.displays.map((displayName, index) => Displays[displayName](index))}
          </PlaylistLoadSuspenser>
        </React.Suspense>
      </ContextDispatchAppState.Provider >
    </ContextAppState.Provider>
  )
}

AppRoot.render(<App />)

const PlaylistLoadSuspenser: React.FC<{ children: JSX.Element | JSX.Element[] }> = (props) => {
  const dispatch = React.useContext(ContextDispatchAppState)
  const appState = React.useContext(ContextAppState)

  if (!appState.isPlaylistsLoaded) {
    const playlists = sPlaylists.read()
    dispatch({
      type: 'load-playlists',
      props: playlists
    })
  }

  return props.children;
}

