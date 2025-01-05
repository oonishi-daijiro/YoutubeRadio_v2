// import { log } from "node:console";
// import type { Playlist, PrimitivePlaylist } from "../../lib/config";
import type YoutubeRadioPreload from "../../preload/player";


import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { DefaultPlayerState, defaultPlaylist, type PlayerState, Reducer, type ReducerActions } from "./reducer";
import { type PrimitivePlaylist } from "../../lib/config";
import { log } from "console";
// import SuspenseResource from "../../lib/suspense-resource";


interface preload extends Window {
   YoutubeRadio: YoutubeRadioPreload;
   player: YT.Player;
   onYouTubeIframeAPIReady: () => void;
}

declare const window: preload;
// declare const YT: {
//    Player: new (p: string, pp: unknown) => YT.Player;
// };

// window.addEventListener("load", () => {
//    window.YoutubeRadio.emitWindowGetReady();
// });

// window.onYouTubeIframeAPIReady = function () {
//    // when youtube iframe api get ready, this function will call
//    player = new YT.Player("player", {
//       height: "300",
//       width: "288",
//       events: {
//          onStateChange: (stat: YT.OnStateChangeEvent) => {
//             switch (stat.data) {
//                case 1:
//                   window.YoutubeRadio.emitPlayerStartPlaying();
//                   break;
//             }
//          },
//          onReady: playerOnReady,
//          onError: (err: YT.OnErrorEvent) => {
//             setTimeout(() => {
//                player.nextVideo();
//             }, 2500);
//             console.error("iframe api Error:", err);
//          },
//       },
//       host: "https://www.youtube-nocookie.com",
//    });
//    window.player = player;
// };


// window.YoutubeRadio.onSetShuffleCurrentPlaylist((shuffle: boolean) => {
//    player.setShuffle(shuffle);
// });

// window.YoutubeRadio.onLoadPlaylist(
//    async (arg: { name: string; index: number }) => {
//       const playlist = (await getPlaylists()).find((e) => e.name === arg.name);
//       await loadPlaylist(playlist as PrimitivePlaylist, arg.index);
//    }
// );

// interface loadPlaylistParm {
//    listType?: string;
//    list?: string | string;
//    playlist?: string[] | string;
//    index?: number;
//    startSeconds?: number;
//    suggestedQuality?: string;
// }

// let currentPlayingListName = "";

// const buttonOpenSelectPlaylist = document.getElementById("getUrl");
// buttonOpenSelectPlaylist!.addEventListener("click", () => {
//    window.YoutubeRadio.openSelectPlaylistWindow(currentPlayingListName);
// });

// async function loadPlaylist(
//    appliedPlaylist: PrimitivePlaylist,
//    index: number
// ): Promise<void> {
//    if ((appliedPlaylist?.name).length === 0) {
//       return;
//    }
//    player.setShuffle(false);
//    player.stopVideo();
//    currentPlayingListName = appliedPlaylist.name;

//    if (appliedPlaylist.type === "youtube") {
//       (player.loadPlaylist as (parm: loadPlaylistParm) => void)({
//          listType: "playlist",
//          list: appliedPlaylist.playlistID,
//          index,
//          startSeconds: 0,
//       });
//       await window.YoutubeRadio.onPlayerStartPlaying();
//       const videos = player.getPlaylist().map((id) => {
//          return {
//             id,
//             title: "",
//          };
//       });

//       if (videos.length === 0) return;
//       appliedPlaylist.videos = videos;
//       await window.YoutubeRadio.editPlaylist(
//          appliedPlaylist.name,
//          appliedPlaylist
//       ).catch((err): void => {
//          console.log(err);
//       }); // For update playlist without using api key
//    } else if (appliedPlaylist.type === "youtube_radio") {
//       if (appliedPlaylist?.name === "" || appliedPlaylist.videos.length === 0) {
//          return;
//       }
//       const idList: string[] = appliedPlaylist.videos.map((e) => {
//          return e.id;
//       });
//       (player.loadPlaylist as (parm: loadPlaylistParm) => void)({
//          listType: "playlist",
//          playlist: idList,
//          index,
//          startSeconds: 0,
//       });
//    }
//    player.setLoop(true);
//    player.setShuffle(appliedPlaylist.isShuffle);
// }

// async function playerOnReady(): Promise<void> {
//    const volume = await window.YoutubeRadio.getVolume();
//    const [playlist] = await getPlaylists();
//    await loadPlaylist(playlist, 0);
//    setVolume(volume);
// }

// window.YoutubeRadio.onVideoPlayed(() => {
//    pauseButton!.className = "fas fa-pause";
//    soundBars.forEach((element) => {
//       (element as HTMLElement).style.animationPlayState = "running";
//    });
// });

// window.YoutubeRadio.onVideoPaused(() => {
//    pauseButton!.className = "fas fa-play";
//    soundBars.forEach((element) => {
//       (element as HTMLElement).style.animationPlayState = "paused";
//    });
// });

// window.YoutubeRadio.onReqPauseVideo(() => {
//    pauseVideo();
// });
// window.YoutubeRadio.onReqPlayVideo(() => {
//    playVideo();
// });

// window.YoutubeRadio.onReqPreviousVideo(() => {
//    previousVideo();
// });

// window.YoutubeRadio.onNextVideo(() => {
//    nextVideo();
// });

// function nextVideo(): void {
//    player.nextVideo();
// }

// function previousVideo(): void {
//    player.previousVideo();
// }

// function pauseVideo(): void {
//    pauseButton!.className = "fas fa-play";
//    soundBars.forEach((element) => {
//       (element as HTMLElement).style.animationPlayState = "paused";
//    });
//    player.pauseVideo();
// }

// function playVideo(): void {
//    pauseButton!.className = "fas fa-pause";
//    soundBars.forEach((element) => {
//       (element as HTMLElement).style.animationPlayState = "running";
//    });
//    player.playVideo();
// }

// const pauseButton = document.getElementById("pause");

// pauseButton!.addEventListener(
//    "click",
//    () => {
//       if (player.getPlaylist() === null) {
//          // when the player didnt has any playlist
//          return;
//       }
//       if (pauseButton!.className === "fas fa-pause") {
//          pauseVideo();
//       } else {
//          playVideo();
//       }
//    },
//    false
// );

// const buttonPreviousVideo = document.getElementById("previousVideo");

// buttonPreviousVideo!.addEventListener("click", () => {
//    // when the player didnt has any playlist
//    if (player.getPlaylist() === null) {
//       return;
//    }
//    previousVideo();
// });

// const buttonNextVideo = document.getElementById("nextVideo");

// buttonNextVideo!.addEventListener(
//    "click",
//    () => {
//       // when the player didnt has any playlist
//       if (player.getPlaylist() === null) {
//          return;
//       }
//       nextVideo();
//    },
//    false
// );

// const buttonVolume = document.getElementById("volume");

// buttonVolume!.addEventListener(
//    "click",
//    () => {
//       buttonVolume!.style.display = "none";
//       canvas.style.display = "block";
//       const vokumeNum = 50 - player.getVolume() / 2;
//       field!.fillStyle = "#444444";
//       field!.fillRect(0, vokumeNum, canvas.width, canvas.height);
//    },
//    false
// );

// const canvas = document.getElementById("canvas") as HTMLCanvasElement;
// const field = canvas.getContext("2d");

// function setVolumeBar(volume: number): void {
//    if (volume > 100) {
//       volume = 100;
//    }
//    const relativeVolume = volume / 100;
//    field!.fillStyle = "#444444";
//    field!.clearRect(0, 0, canvas.width, relativeVolume + 50);
//    field!.fillRect(
//       0,
//       canvas.height,
//       canvas.width,
//       -relativeVolume * canvas.height
//    );
//    if (volume === 0) {
//       buttonVolume!.className = "fas fa-volume-mute";
//    } else if (volume > 0 && volume < 50) {
//       buttonVolume!.className = "fas fa-volume-down";
//    } else if (volume > 50) {
//       buttonVolume!.className = "fas fa-volume-up";
//    }
// }

// function setVolume(volume: number): void {
//    setVolumeBar(volume);
//    player.setVolume(volume);
// }

// canvas.addEventListener(
//    "click",
//    (event) => {
//       if (event.which === 1) {
//          setVolume(100 - event.offsetY * 2);
//       }
//    },
//    false
// );

// canvas.addEventListener(
//    "mousemove",
//    (event) => {
//       if (event.which === 1) {
//          setVolume(100 - event.offsetY * 2);
//       }
//    },
//    false
// );

// canvas.addEventListener(
//    "mouseup",
//    () => {
//       setTimeout(() => {
//          canvas.style.display = "none";
//          buttonVolume!.style.display = "block";
//       }, 500);
//    },
//    false
// );

// canvas.addEventListener(
//    "mouseout",
//    () => {
//       setTimeout(() => {
//          canvas.style.display = "none";
//          buttonVolume!.style.display = "block";
//       }, 500);
//    },
//    false
// );

// const bars = document.getElementsByClassName("bars");
// const soundBars: Element[] = Array.from(bars);

// const closeButton = document.getElementById("close_button");

// closeButton!.addEventListener(
//    "click",
//    async () => {
//       await window.YoutubeRadio.saveVolume(player.getVolume());
//       window.YoutubeRadio.close();
//    },
//    false
// );

// const minimize = document.getElementById("minimize");

// minimize!.addEventListener(
//    "click",
//    () => {
//       window.YoutubeRadio.minimize();
//    },
//    false
// );



// const sIframePlayerInstance = new SuspenseResource<YT.Player | null>(async (mountElementID: string, option: YT.PlayerOptions) => {
//    interface extWindow extends Window {
//       onYouTubeIframeAPIReady?: () => void
//    };
//    const pl = new Promise<YT.Player>((resolve) => {
//       (window as extWindow).onYouTubeIframeAPIReady = () => {
//          resolve(new YT.Player(mountElementID, option))
//          delete (window as extWindow).onYouTubeIframeAPIReady;
//       };
//    });

//    const tag = document.createElement("script");
//    tag.src = "https://www.youtube.com/iframe_api";
//    const firstScriptTag = document.getElementsByTagName("script")[0];
//    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

//    return await pl;
// }, null);


interface loadPlaylistParm {
   listType?: string;
   list?: string | string;
   playlist?: string[] | string;
   index?: number;
   startSeconds?: number;
   suggestedQuality?: string;
}


const ContextDispatchAppState = React.createContext<(ReducerAction: ReducerActions[keyof ReducerActions]) => void>(() => { console.log('reducer is not ready') })
const ContextAppState = React.createContext<PlayerState>(DefaultPlayerState)

const App: React.FC = () => {
   const [appState, dispatchAppState] = React.useReducer(Reducer, DefaultPlayerState)

   React.useEffect(() => {
      setOnloadEventHandler(dispatchAppState);
   }, []);
   console.log("approot:", appState.iframePlayerInstance);


   if (appState.currentPlaylist.type === 'youtube') {
      console.log(appState.iframePlayerInstance);



      // (appState.iframePlayerInstance?.loadPlaylist as (parm: loadPlaylistParm) => void)({
      //    listType: "playlist",
      //    list: appState.currentPlaylist.playlistID,
      //    index: appState.startIndex,
      //    startSeconds: 0,
      // });

   } else if (appState.currentPlaylist.type === "youtube_radio") {
      const idList = appState.currentPlaylist.videos.map(e => e.id);
      // appState.iframePlayerInstance?.loadPlaylist(idList, appState.startIndex, 0);

      (appState.iframePlayerInstance?.loadPlaylist as (parm: loadPlaylistParm) => void)({
         listType: "playlist",
         playlist: idList,
         index: appState.startIndex,
         startSeconds: 0,
      });
   };


   return (
      <>
         <ContextAppState.Provider value={appState}>
            <ContextDispatchAppState.Provider value={dispatchAppState}>
               <WindowInterface />
               <React.Suspense fallback={"suspend"}>
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


const WindowInterface: React.FC = () => {
   const appState = React.useContext(ContextAppState);

   const minimizeWindow = (): void => {
      window.YoutubeRadio.minimize();
   }
   const openSelectPlaylistWindow = (): void => {
      window.YoutubeRadio.openSelectPlaylistWindow("");
   }

   const closeWindow = async (): Promise<void> => {
      await window.YoutubeRadio.saveVolume(appState.currentVolume);
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


const IframeYoutubePlayer: React.FC = () => {
   const playerDomID = "player";
   const dispatchAppState = React.useContext(ContextDispatchAppState);
   const appState = React.useContext(ContextAppState);


   const player = useYoutubeIframePlayer(playerDomID, {
      height: 300,
      width: 288,
      events: {
         onStateChange: (stat: YT.OnStateChangeEvent) => {
            console.log("on state change");

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
            dispatchAppState({
               type: "set-current-playing-playlist",
               props: await getFirstPlaylist()
            })
            const idList = appState.currentPlaylist.videos.map(e => e.id);
            // appState.iframePlayerInstance?.loadPlaylist(idList, appState.startIndex, 0);

            (appState.iframePlayerInstance?.loadPlaylist as (parm: loadPlaylistParm) => void)({
               listType: "playlist",
               playlist: idList,
               index: appState.startIndex,
               startSeconds: 0,
            });
         },
         onError: (err: YT.OnErrorEvent) => {
            console.error(err);
         },
      },
      host: "https://www.youtube-nocookie.com",
   });

   React.useEffect(() => {
      dispatchAppState({
         type: "set-iframe-player-instance",
         props: player
      })
      console.log(player);

   }, [player]);

   return (
      <>
         <div id="player_container">
            <div id={playerDomID}></div>
         </div>
      </>
   )
};

const PlayerInterface: React.FC = () => {
   const playPreviousVideo = (): void => {

   }
   const pauseVideo = (): void => { }
   const playNextVideo = (): void => { }


   return (
      <div id="interface">
         <i className="fas fa-angle-double-right" id="previousVideo" onClick={playPreviousVideo}></i>
         <i className="fas fa-pause" id="pause" onClick={pauseVideo}></i>
         <i className="fas fa-angle-double-right" id="nextVideo" onClick={playNextVideo}></i>
      </div>
   )
};

const PlayerVolumeController: React.FC = () => {
   return (
      <>
         <canvas id="canvas" width="10px" height="50px"></canvas>
         <i className="fas fa-volume-up" id="volume"></i>
      </>
   )
}

const PlayerSoundBar: React.FC = () => {
   return (
      <div id="soundbar">
         <div id="bar1" className="bars"></div>
         <div id="bar2" className="bars"></div>
         <div id="bar3" className="bars"></div>
      </div>
   )
}


async function getFirstPlaylist(): Promise<PrimitivePlaylist> {
   const allPlaylists = await window.YoutubeRadio.getPlaylists();
   if (allPlaylists.length > 0) {
      return allPlaylists[0];
   } else {
      return defaultPlaylist
   }
}

function setOnloadEventHandler(dispatchAppState: React.Dispatch<ReducerActions[keyof ReducerActions]>): void {
   window.YoutubeRadio.onLoadPlaylist(
      async (arg: { name: string; index: number }) => {

         const playlist = (await window.YoutubeRadio.getPlaylists()).find((e) => e.name === arg.name) ?? defaultPlaylist;
         dispatchAppState({
            type: 'set-current-playing-playlist',
            props: playlist
         })
      }
   )
}

function useYoutubeIframePlayer(mountElementID: string, option: YT.PlayerOptions): YT.Player | null {
   interface extWindow extends Window {
      onYouTubeIframeAPIReady?: () => void
   };
   const [plyr, setPlyr] = React.useState<YT.Player | null>(null);
   (window as extWindow).onYouTubeIframeAPIReady = () => {
      setPlyr(new YT.Player(mountElementID, option));
      delete (window as extWindow).onYouTubeIframeAPIReady;
   };

   const tag = document.createElement("script");
   tag.src = "https://www.youtube.com/iframe_api";
   const firstScriptTag = document.getElementsByTagName("script")[0];
   firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

   return plyr;
}
