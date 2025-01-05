import { type PrimitivePlaylist } from "../../lib/config";

export interface PlayerState {
  currentPlaylist: PrimitivePlaylist;
  playingState: "pausing" | "playing";
  lastError: number;
  iframePlayerInstance: YT.Player | null;
  iframePlayerState: YT.PlayerState;
  currentVolume: number;
  startIndex: number;
}

export const defaultPlaylist: PrimitivePlaylist = {
  name: "",
  videos: [],
  type: "youtube_radio",
  isShuffle: false,
};

export const DefaultPlayerState: PlayerState = {
  currentPlaylist: defaultPlaylist,
  playingState: "pausing",
  lastError: 0,
  iframePlayerInstance: null,
  iframePlayerState: 0,
  currentVolume: 50,
  startIndex: 0,
};

export interface ReducerActions {
  "pause-video": {
    type: "pause-video";
  };
  "set-iframe-player-instance": {
    type: "set-iframe-player-instance";
    props: PlayerState["iframePlayerInstance"];
  };
  "set-iframe-player-state": {
    type: "set-iframe-player-state";
    props: PlayerState["iframePlayerState"];
  };
  "set-current-playing-playlist": {
    type: "set-current-playing-playlist";
    props: PrimitivePlaylist;
  };
}

export function Reducer(
  currentAppState: PlayerState,
  action: ReducerActions[keyof ReducerActions]
): PlayerState {
  switch (action.type) {
    case "set-iframe-player-instance":
      if (
        currentAppState.iframePlayerInstance === null &&
        action.props !== null
      ) {
        console.log("load player instance");
        return {
          ...currentAppState,
          iframePlayerInstance: action.props,
        };
      } else {
        return currentAppState;
      }
    case "pause-video":
      return { ...currentAppState, playingState: "pausing" };
    case "set-current-playing-playlist":
      if (action.props.name !== currentAppState.currentPlaylist.name) {
        return { ...currentAppState, currentPlaylist: action.props };
      } else {
        return currentAppState;
      }
  }
  return DefaultPlayerState;
}
