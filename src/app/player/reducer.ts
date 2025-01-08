import { type PrimitivePlaylist } from "../../lib/config";

export interface PlayerState {
  currentPlaylist: PrimitivePlaylist;
  playingState: "pausing" | "playing";
  lastError: number;
  player: YT.Player;
  iframePlayerState: YT.PlayerState;
  isPlayerLoaded: boolean;
  volume: number;
  startIndex: number;
}

export const defaultPlaylist: PrimitivePlaylist = {
  name: "",
  videos: [],
  type: "youtube_radio",
  isShuffle: false,
};

const emptyObj = {};
const noopHandler = {
  get() {
    return () => {
      console.error("WARING: player instance is not set. This does nothing.");
    };
  },
};

const noopIframeInstance = new Proxy(emptyObj, noopHandler) as YT.Player;

export const DefaultPlayerState: PlayerState = {
  currentPlaylist: defaultPlaylist,
  playingState: "pausing",
  lastError: 0,
  player: noopIframeInstance,
  iframePlayerState: 0,
  isPlayerLoaded: false,
  volume: 50,
  startIndex: 0,
};

export interface ReducerActions {
  "pause-video": {
    type: "pause-video";
  };
  "set-iframe-player-instance": {
    type: "set-iframe-player-instance";
    props: PlayerState["player"];
  };
  "set-iframe-player-state": {
    type: "set-iframe-player-state";
    props: PlayerState["iframePlayerState"];
  };
  "set-current-playing-playlist": {
    type: "set-current-playing-playlist";
    props: PrimitivePlaylist;
  };
  "set-current-playing-state": {
    type: "set-current-playing-state";
    props: PlayerState["playingState"];
  };
  "set-volume": {
    type: "set-volume";
    props: PlayerState["volume"];
  };
}

export function Reducer(
  currentAppState: PlayerState,
  action: ReducerActions[keyof ReducerActions]
): PlayerState {
  console.log(action.type, (action as any).props, currentAppState);

  switch (action.type) {
    case "set-iframe-player-instance":
      return {
        ...currentAppState,
        player: action.props,
        isPlayerLoaded: true,
      };
    case "pause-video":
      return { ...currentAppState, playingState: "pausing" };
    case "set-iframe-player-state":
      return { ...currentAppState, iframePlayerState: action.props };
    case "set-current-playing-playlist":
      return { ...currentAppState, currentPlaylist: action.props };
    case "set-current-playing-state":
      return { ...currentAppState, playingState: action.props };
    case "set-volume":
      return { ...currentAppState, volume: action.props };
  }
  return DefaultPlayerState;
}
