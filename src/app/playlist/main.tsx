import * as React from "react"
import * as ReactDOM from "react-dom/client";
import { ReducerActions, Reducer, AppState, DefaultAppState, Displays } from "./reducer";
import { YoutubeRadioPreload } from "../../preload/playlist";
import { Playlist } from "../../lib/config";

console.time('playlist-window-load')

interface preload extends Window {
  YoutubeRadio: YoutubeRadioPreload
}
export declare const window: preload

class SuspenseResource<T> {
  constructor(resourceFetcher: () => Promise<T>, defaultData: T) {
    this.resouseFetcher = resourceFetcher
    this.data = defaultData
    this.setFetcher()
  }
  read(): T {
    switch (this.stat) {
      case 'pending':
        throw this.promise
      case 'fullfilled':
        return this.data
      case 'rejected':
        return this.data
    }
  }

  reLoad(): void {
    this.stat = 'pending'
    this.setFetcher()
  }

  private setFetcher() {
    this.promise = this.resouseFetcher().then(data => {
      this.data = data
      this.stat = 'fullfilled'
    }).catch(() => {
      this.stat = 'rejected'
    })
  }

  private stat: 'pending' | 'fullfilled' | 'rejected' = 'pending'
  private data: T
  private resouseFetcher: () => Promise<T>
  private promise: Promise<void>

}



const domAppRoot = document.getElementById('root')
const AppRoot = ReactDOM.createRoot(domAppRoot)
export const ContextDispatchAppState = React.createContext<(ReducerAction: ReducerActions[keyof ReducerActions]) => void>(() => console.log("reducer is not ready"))
export const ContextAppState = React.createContext<AppState>(DefaultAppState)


const App: React.FC = () => {
  const [appState, dispatchAppState] = React.useReducer(Reducer, DefaultAppState)
  return (
    <ContextAppState.Provider value={appState}>
      <ContextDispatchAppState.Provider value={dispatchAppState}>
        <React.Suspense fallback={<></>}>
          <Suspenser>
            {appState.displays.map((displayName, index) => Displays[displayName](index))}
          </Suspenser>
        </React.Suspense>
      </ContextDispatchAppState.Provider >
    </ContextAppState.Provider>
  )
}

AppRoot.render(<App />)
console.timeEnd('playlist-window-load')
export const sPlaylists = new SuspenseResource<Playlist[]>(window.YoutubeRadio.getPlaylists, [])

const Suspenser: React.FC<{ children: JSX.Element[] }> = (props) => {
  const dispatch = React.useContext(ContextDispatchAppState)
  const appState = React.useContext(ContextAppState)

  if (!appState.isPlaylistsLoaded) {
    const playlists = sPlaylists.read()
    dispatch({
      'type': 'load-playlists',
      props: playlists
    })
  }

  return (<>
    {...props.children}
  </>)
}
