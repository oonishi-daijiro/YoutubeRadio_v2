import * as React from "react";
import { sPlaylists, type preload, ContextAppState } from "./main";
import { type playlistNavigation } from "../../preload/playlist";
import { type ReducerActions } from "./reducer";
import type { PrimitivePlaylist } from "../../lib/config";

declare const window: preload;

export function loadPlaylist(name: string, index: number = 0): void {
  window.YoutubeRadio.loadPlaylist(name, index);
}

export function navigatePlaylist(navigation: playlistNavigation): void {
  window.YoutubeRadio.navigatePlaylist(navigation);
}

interface VideoURL {
  protocol: string;
  id: string;
  host: string;
}

export function parseYoutubeVideoURL(url: string): VideoURL {
  const reIncludesHttps = /^https:\/\//;
  url = reIncludesHttps.test(url) ? url : `https://${url}`;
  const ul = new URL(url);

  return {
    protocol: ul.protocol ?? "",
    id: ul.searchParams.get("v") ?? "",
    host: ul.hostname ?? "",
  };
}

interface PlaylistURL {
  protocol: string;
  id: string;
  host: string;
}

export function parsePlaylistURL(url: string): PlaylistURL {
  const reIncludesHttps = /^https:\/\//;
  url = reIncludesHttps.test(url) ? url : `https://${url}`;

  // const parsedURL = window.YoutubeRadio.parse(url, true);
  const parsedURL = new URL(url);

  return {
    protocol: parsedURL.protocol ?? "",
    id: parsedURL.searchParams.get("list") ?? "",
    host: parsedURL.hostname ?? "",
  };
}

export async function popDisplayWithAnimation(
  dispatch: (ReducerAction: ReducerActions[keyof ReducerActions]) => void
): Promise<void> {
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
): Promise<void> {
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
): Promise<void> {
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

export async function sleep(time: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

export class MultipileConditions {
  constructor(...conditions: boolean[]) {
    this.conditions = [...conditions];
  }

  add(condition: boolean, option: boolean = true): this {
    if (option) {
      this.conditions.push(condition);
    }
    return this;
  }

  reduce(): boolean {
    return this.conditions.reduce((p, c) => p && c, true);
  }

  private readonly conditions: boolean[];
}

export function isValidEdit(playlistEdited: PrimitivePlaylist): boolean {
  const appState = React.useContext(ContextAppState);

  const isValidPlaylistName = new MultipileConditions();
  const isValidPlaylistURL = new MultipileConditions();
  const isValidVideos = new MultipileConditions();

  const parsedPlaylistURL = parsePlaylistURL(
    getPlaylistURLFromPlaylistID(playlistEdited.playlistID ?? "")
  );

  isValidPlaylistName
    .add(playlistEdited.name.length > 0)
    .add(
      !appState.playlists.map((pl) => pl.name).includes(playlistEdited.name),
      playlistEdited.name !== appState.targetPlaylist.name
    );

  isValidPlaylistURL
    .add(parsedPlaylistURL.host === "www.youtube.com")
    .add(parsedPlaylistURL.id.length === 34)
    .add(parsedPlaylistURL.protocol === "https:");

  isValidVideos
    .add(
      playlistEdited.videos
        .map((v) => parseYoutubeVideoURL(getYoutubeURLFromID(v.id)))
        .map(
          (p) =>
            p.host === "www.youtube.com" &&
            p.id.length === 11 &&
            p.protocol === "https:"
        )
        .reduce((c, p) => c && p, true)
    )
    .add(playlistEdited.videos.length > 0);

  let isValidEdit = false;

  if (playlistEdited.type === "youtube") {
    isValidEdit = isValidPlaylistName.reduce() && isValidPlaylistURL.reduce();
  } else if (playlistEdited.type === "youtube_radio") {
    isValidEdit = isValidPlaylistName.reduce() && isValidVideos.reduce();
  } else if (playlistEdited.type === "single_video") {
    isValidEdit = isValidPlaylistName.reduce() && isValidVideos.reduce();
  }
  return isValidEdit;
}
