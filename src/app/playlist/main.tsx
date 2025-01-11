import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { type ReducerActions, Reducer, type AppState, DefaultAppState } from './reducer'
import { type YoutubeRadioPreload } from '../../preload/playlist'
import { Displays, FallbackReloadPlaylist } from './components'
import SuspenseResource from '../../lib/suspense-resource'

export interface preload extends Window {
  YoutubeRadio: YoutubeRadioPreload
}

declare const window: preload

const domAppRoot = document.getElementById('root')
const AppRoot = ReactDOM.createRoot(domAppRoot!)

export const ContextDispatchAppState = React.createContext<(ReducerAction: ReducerActions[keyof ReducerActions]) => void>(() => { console.log('reducer is not ready') })

export const ContextAppState = React.createContext<AppState>(DefaultAppState)

export const sPlaylists = new SuspenseResource(window.YoutubeRadio.getPlaylists, [])

export type dispathFunc = (ReducerAction: ReducerActions[keyof ReducerActions]) => void


const App: React.FC = () => {
  const [appState, dispatchAppState] = React.useReducer(Reducer, DefaultAppState)

  return (
    <ContextAppState.Provider value={appState}>
      <ContextDispatchAppState.Provider value={dispatchAppState}>
        <React.Suspense fallback={<FallbackReloadPlaylist index={0} />}>
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
  
  const playlists = sPlaylists.read()

  React.useEffect(() => {
    if (!appState.isPlaylistsLoaded) {
      dispatch({
        type: 'load-playlists',
        props: playlists
      })
    }
  }, [appState]);

  return props.children;
}

