import { sPlaylists, preload } from "./main";
import { playlistNavigation } from "../../preload/playlist";
import { ReducerActions } from "./reducer";

declare const window: preload;

export function loadPlaylist(name: string, index: number = 0) {
  window.YoutubeRadio.loadPlaylist(name, index);
}

export function navigatePlaylist(navigation: playlistNavigation) {
  window.YoutubeRadio.navigatePlaylist(navigation);
}

type VideoURL = {
  protocol: string;
  id: string;
  host: string;
};

export function parseYoutubeVideoURL(url: string): VideoURL {
  const reIncludesHttps = /^https:\/\//;
  url = reIncludesHttps.test(url) ? url : `https://${url}`;
  const parsedURL = window.YoutubeRadio.parse(url, true);
  return {
    protocol: parsedURL.protocol ?? "",
    id: (parsedURL.query as { v: string }).v ?? "",
    host: parsedURL.hostname ?? "",
  };
}

type PlaylistURL = {
  protocol: string;
  id: string;
  host: string;
};

export function parsePlaylistURL(url: string): PlaylistURL {
  const reIncludesHttps = /^https:\/\//;
  url = reIncludesHttps.test(url) ? url : `https://${url}`;

  const parsedURL = window.YoutubeRadio.parse(url, true);
  return {
    protocol: parsedURL.protocol ?? "",
    id: (parsedURL.query as { list: string }).list ?? "",
    host: parsedURL.hostname ?? "",
  };
}

export async function popDisplayWithAnimation(
  dispatch: (ReducerAction: ReducerActions[keyof ReducerActions]) => void
) {
  // dispatch({
  //   type: 'animate',
  //   props: 'pop'
  // })
  // await sleep(700)
  dispatch({
    type: "pop-display",
  });
  // dispatch({
  //   type: 'animation-end'
  // })
}

export async function pushDisplayWithAnimation(
  dispatch: (ReducerAction: ReducerActions[keyof ReducerActions]) => void,
  displayName: ReducerActions["push-display"]["props"]
) {
  dispatch({
    type: "push-display",
    props: displayName,
  });
  // dispatch({
  //   type: 'animate',
  //   props: 'push'
  // })
  // await sleep(700)
  // dispatch({
  //   type: 'animation-end'
  // })
}

export async function reloadPlaylistsWithAnimation(
  dispatch: (ReducerAction: ReducerActions[keyof ReducerActions]) => void
) {
  dispatch({
    type: "animate",
    props: "reload",
  });
  await sleep(700);
  dispatch({
    type: "animation-end",
  });
  sPlaylists.reload();
  dispatch({
    type: "reload-playlists",
  });
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

export function getYoutubeThumbnailURLFromID(videoID: string): string {
  return videoID.length === 11
    ? `https://img.youtube.com/vi/${videoID ?? ""}/sddefault.jpg`
    : "";
}

export function getPlaylistURLFromPlaylistID(id: string): string {
  return `https://www.youtube.com/playlist?list=${id}`;
}

export function getYoutubeURLFromID(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function sleep(time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

export class MultipileConditions {
  constructor(...conditions: boolean[]) {
    this.conditions = [...conditions];
  }
  add(condition: boolean, option: boolean = true): MultipileConditions {
    if (option) {
      this.conditions.push(condition);
    }
    return this;
  }
  reduce(): boolean {
    return this.conditions.reduce((p, c) => p && c, true);
  }
  private conditions: boolean[];
}
