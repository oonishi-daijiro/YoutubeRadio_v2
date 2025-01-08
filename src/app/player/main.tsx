import type YoutubeRadioPreload from "../../preload/player";
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { DefaultPlayerState, defaultPlaylist, type PlayerState, Reducer, type ReducerActions } from "./reducer";
import { type PrimitivePlaylist } from "../../lib/config";
import SuspenseResource from "../../lib/suspense-resource";

interface preload extends Window {
   YoutubeRadio: YoutubeRadioPreload;
   player: YT.Player;
   onYouTubeIframeAPIReady: () => void;
}

declare const window: preload;

const ContextDispatchAppState = React.createContext<(ReducerAction: ReducerActions[keyof ReducerActions]) => void>(() => { console.log('reducer is not ready') })
type appstateDispatcher_t = React.Dispatch<ReducerActions[keyof ReducerActions]>;

const ContextAppState = React.createContext<PlayerState>(DefaultPlayerState)

const sIframePlayerConstructor = new SuspenseResource(async (): Promise<(mountDOMid: string, option: YT.PlayerOptions) => YT.Player> => {
   interface extWindow extends Window {
      onYouTubeIframeAPIReady?: () => void
   }
   const playerConstructor = new Promise<(mountDOMid: string, option: YT.PlayerOptions) => YT.Player>(resolve => {
      (window as extWindow).onYouTubeIframeAPIReady = () => {
         resolve((mountDOMid: string, option: YT.PlayerOptions) => new YT.Player(mountDOMid, option));
         delete (window as extWindow).onYouTubeIframeAPIReady;
      };
   })

   const tag = document.createElement("script");
   tag.src = "https://www.youtube.com/iframe_api";
   const firstScriptTag = document.getElementsByTagName("script")[0];
   firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

   return await playerConstructor;
}, () => ({} as unknown as YT.Player));

window.addEventListener("load", () => {
   window.YoutubeRadio.emitWindowGetReady();
});

const App: React.FC = () => {
   const [appState, dispatchAppState] = React.useReducer(Reducer, DefaultPlayerState)

   React.useEffect(() => {
      addExternalEventListenner(appState, dispatchAppState);
   }, [appState.isPlayerLoaded]);

   React.useEffect(() => {
   }, [appState.currentPlaylist]);

   React.useEffect(() => {
      window.YoutubeRadio.getVolume().then(volume => {
         dispatchAppState({
            type: 'set-volume',
            props: volume
         })
      })
   }, []);


   return (
      <>
         <ContextAppState.Provider value={appState}>
            <ContextDispatchAppState.Provider value={dispatchAppState}>
               <WindowInterface />
               <React.Suspense fallback={<PlayerFallback />}>
                  <IframeYoutubePlayer />
               </React.Suspense>
               <PlayerInterface />
               <PlayerVolumeController />
               <PlayerSoundBar />
            </ContextDispatchAppState.Provider>
         </ContextAppState.Provider>
      </>
   )
}

const domAppRoot = document.getElementById('root')
const AppRoot = ReactDOM.createRoot(domAppRoot!)
AppRoot.render(<App />)


function addExternalEventListenner(appState: PlayerState, dispatchAppState: appstateDispatcher_t): void {
   if (appState.isPlayerLoaded) {
      const { player } = appState;
      window.YoutubeRadio.onLoadPlaylist(
         async (arg: { name: string; index: number }) => {
            const playlist = (await window.YoutubeRadio.getPlaylists()).find((e) => e.name === arg.name) ?? defaultPlaylist;
            dispatchAppState({
               type: 'set-current-playing-playlist',
               props: playlist
            })
         }
      );
      // paused by webcontens
      window.YoutubeRadio.onVideoPlayed(() => {
         dispatchAppState({
            'type': 'set-current-playing-state',
            props: 'playing'
         })
      });

      window.YoutubeRadio.onVideoPaused(() => {
         dispatchAppState({
            "type": 'set-current-playing-state',
            props: 'pausing'
         })
      });
      // from taskbar thumbnail button
      window.YoutubeRadio.onReqPauseVideo(() => {
         dispatchAppState({
            "type": 'set-current-playing-state',
            props: 'pausing'
         })
         player.pauseVideo();
      });

      window.YoutubeRadio.onReqPlayVideo(() => {
         dispatchAppState({
            "type": 'set-current-playing-state',
            props: 'playing'
         })
         player.playVideo();
      });

      window.YoutubeRadio.onReqPreviousVideo(() => {
         player.previousVideo();
         dispatchAppState({
            type: 'set-current-playing-state',
            props: 'playing'
         })
      });

      window.YoutubeRadio.onNextVideo(() => {
         player.nextVideo();
         dispatchAppState({
            type: 'set-current-playing-state',
            props: 'playing'
         })
      });

      window.YoutubeRadio.onSetShuffleCurrentPlaylist((shuffle: boolean) => {
         player.setShuffle(shuffle);
      });
   }
}


const WindowInterface: React.FC = () => {
   const appState = React.useContext(ContextAppState);

   const minimizeWindow = (): void => {
      window.YoutubeRadio.minimize();
   }
   const openSelectPlaylistWindow = (): void => {
      window.YoutubeRadio.openSelectPlaylistWindow("");
   }

   const closeWindow = async (): Promise<void> => {
      await window.YoutubeRadio.saveVolume(appState.volume);
      window.YoutubeRadio.close();
   }

   return (
      <div id="windowInterface">
         <i className="fas fa-window-minimize" id="minimize" onClick={minimizeWindow} />
         <i className="fas fa-cog" id="getUrl" onClick={openSelectPlaylistWindow} />
         <i className="fas fa-times-circle" id="close_button" onClick={closeWindow} />
      </div>
   )
}
const PlayerFallback: React.FC = () => {
   return (
      <div id="player_container">
         <div id="player-fallback"></div>
      </div>
   )
}

const IframeYoutubePlayer: React.FC = () => {
   const playerDomID = "player";

   const playerConstructor = sIframePlayerConstructor.read();
   const dispatchAppState = React.useContext(ContextDispatchAppState);

   React.useEffect(() => {
      setupPlayer(playerConstructor, playerDomID, dispatchAppState);
   }, [playerConstructor]);

   return (
      <>
         <div id="player_container">
            <div id={playerDomID}></div>
         </div>
      </>
   )
};

const PlayerInterface: React.FC = () => {
   const appstate = React.useContext(ContextAppState);
   const dispatchAppState = React.useContext(ContextDispatchAppState);

   const pauseVideo = (): void => {
      appstate.player.pauseVideo();
      dispatchAppState({
         type: 'set-current-playing-state',
         props: 'pausing'
      })

   }
   const playVideo = (): void => {
      appstate.player.playVideo();
      dispatchAppState({
         type: 'set-current-playing-state',
         props: 'playing'
      })
   }

   const playNextVideo = (): void => {
      appstate.player.nextVideo();
      dispatchAppState({
         type: 'set-current-playing-state',
         props: 'playing'
      })
   }
   const playPreviousVideo = (): void => {
      appstate.player.previousVideo();
      dispatchAppState({
         type: 'set-current-playing-state',
         props: 'playing'
      })
   }

   const pauseNplayButtonClassName = (): string => {
      if (appstate.playingState === 'playing') {
         return "fas fa-pause"
      } else {
         return "fas fa-play"
      }
   }

   return (
      <div id="interface">
         <i className="fas fa-angle-double-right" id="previousVideo" onClick={playPreviousVideo}></i>
         <i className={pauseNplayButtonClassName()} id="pause" onClick={appstate.playingState === "playing" ? pauseVideo : playVideo}></i>
         <i className="fas fa-angle-double-right" id="nextVideo" onClick={playNextVideo}></i>
      </div>
   )
};


function drawVolumeRectOnCanvas(volume: number, target: HTMLCanvasElement | null): void {

   if (target !== null) {
      const field = target.getContext('2d');
      if (field !== null) {
         const canvas = target;
         if (volume > 100) {
            volume = 100;
         }
         const relativeVolume = volume / 100;
         field.fillStyle = "#444444";
         field.clearRect(0, 0, target.width, relativeVolume + 50);
         field.fillRect(
            0,
            target.height,
            target.width,
            -relativeVolume * canvas.height
         );
      }
   }
}

const VolumeCanvasImpl: React.FC<Omit<JSX.IntrinsicElements['canvas'], 'ref'> & { volumeref: React.MutableRefObject<number> }> = (props) => {
   console.log("render");
   const canvasRef = React.useRef<HTMLCanvasElement>(null);
   const volume = props.volumeref.current;

   React.useEffect(() => {
      drawVolumeRectOnCanvas(volume, canvasRef.current);
   }, []);

   return <canvas {...props} id="canvas" width="10px" height="50px" ref={canvasRef} ></canvas>
}

const VolumeCanvas = React.memo(VolumeCanvasImpl);

const PlayerVolumeController: React.FC = () => {
   const [isEditVolume, setIsEditVolume] = React.useState(false);
   const dispatchAppstate = React.useContext(ContextDispatchAppState);
   const appstate = React.useContext(ContextAppState);

   const volumeRef = React.useRef(appstate.volume);
   const isMouseDown = React.useRef(false);

   type canvasEventHandler = React.MouseEventHandler<HTMLCanvasElement>;

   const getVolumeFromCanvas = (event: Parameters<canvasEventHandler>[0]): number => {
      const rect = event.currentTarget.getBoundingClientRect();
      const offsetY = event.clientY - rect.top;
      const volume = 100 - offsetY * 2;
      if (volume <= 0) {
         return 0;
      }
      return volume;
   }

   const handleOnclick: canvasEventHandler = React.useCallback((event) => {
      const volume = getVolumeFromCanvas(event);
      drawVolumeRectOnCanvas(volume, event.currentTarget);
      volumeRef.current = volume;

      setTimeout(() => {
         setIsEditVolume(false);
         dispatchAppstate({
            type: 'set-volume',
            props: volume
         })
         appstate.player.setVolume(volumeRef.current);
      }, 500);
   }, [appstate.player]);

   const handleMousemove: canvasEventHandler = React.useCallback((event) => {
      if (isMouseDown.current) {
         const volume = getVolumeFromCanvas(event);
         drawVolumeRectOnCanvas(volume, event.currentTarget);
         volumeRef.current = volume;
         appstate.player.setVolume(volumeRef.current);
      }
   }, [appstate.player]);

   const handleMouseOut: canvasEventHandler = React.useCallback(() => {
      setTimeout(() => {
         setIsEditVolume(false);
         dispatchAppstate({
            type: 'set-volume',
            props: volumeRef.current
         })
         appstate.player.setVolume(volumeRef.current);
      }, 500);
   }, [appstate.player]);

   const handleMouseDown: canvasEventHandler = React.useCallback(() => {
      isMouseDown.current = true;
   }, []);
   const handleMouseUp: canvasEventHandler = React.useCallback(() => {
      isMouseDown.current = false;
   }, []);

   if (!isEditVolume) {
      if (appstate.volume === 0) {
         return <i className="fas fa-volume-mute" id="volume" onClick={() => { setIsEditVolume(true) }}></i>
      } else {
         return <i className="fas fa-volume-up" id="volume" onClick={() => { setIsEditVolume(true) }}></i>
      }
   } else {
      return <VolumeCanvas
         volumeref={volumeRef}
         onClick={handleOnclick}
         onMouseOut={handleMouseOut}
         onMouseMove={handleMousemove}
         onMouseDown={handleMouseDown}
         onMouseUp={handleMouseUp} />
   }
}



const PlayerSoundBar: React.FC = () => {
   const appstate = React.useContext(ContextAppState);
   if (appstate.playingState === "playing") {
      const styleAnimationPlaying: React.CSSProperties = {
         animationPlayState: "running"
      };

      return (
         <div id="soundbar">
            <div id="bar1" style={styleAnimationPlaying}></div>
            <div id="bar2" style={styleAnimationPlaying}></div>
            <div id="bar3" style={styleAnimationPlaying}></div>
         </div>
      )
   } else if (appstate.playingState === "pausing") {
      const styleAnimationPausing: React.CSSProperties = {
         animationPlayState: ""
      };
      return (
         <div id="soundbar">
            <div id="bar1" style={styleAnimationPausing}></div>
            <div id="bar2" style={styleAnimationPausing}></div>
            <div id="bar3" style={styleAnimationPausing}></div>
         </div>
      )
   }

}

async function getFirstPlaylist(): Promise<PrimitivePlaylist> {
   const allPlaylists = await window.YoutubeRadio.getPlaylists();
   if (allPlaylists.length > 0) {
      return allPlaylists[0];
   } else {
      return defaultPlaylist
   }
}

function setupPlayer(playerConstructor: (domID: string, option: YT.PlayerOptions) => YT.Player, domID: string, dispatchAppState: appstateDispatcher_t): YT.Player {
   const player = playerConstructor(domID, {
      height: 300,
      width: 288,
      events: {
         onStateChange: (stat: YT.OnStateChangeEvent) => {
            dispatchAppState({
               type: "set-iframe-player-state",
               props: stat.data
            })
         },
         onReady: async () => {
            dispatchAppState({
               type: "set-iframe-player-instance",
               props: player
            })
            const firstPlaylist = await getFirstPlaylist();
            dispatchAppState({
               type: "set-current-playing-playlist",
               props: firstPlaylist
            })

            // loadPlaylist(player, firstPlaylist, 0);
            dispatchAppState({
               type: "set-current-playing-state",
               props: "playing"
            })
            player.playVideo();
         },
         onError: (err: YT.OnErrorEvent) => {
            console.error(err);
         },
      },
      host: "https://www.youtube-nocookie.com",
   })
   return player;
}
