import { app } from "electron";
import * as electronStore from "electron-store";
import * as diff from "diff";

import * as youtube from "../youtube";

interface _playlistTypes {
  youtube: YoutubePlaylist;
  youtube_radio: YoutubeRadioPlaylist;
  single_video: SingleVideoPlaylist;
}
export type playlistTypes = keyof _playlistTypes;

export const configFile = new electronStore({
  cwd: app.getPath("userData"),
});

const defaultPlaylist: PrimitivePlaylist = {
  name: "",
  videos: [{ id: "", title: "" }],
  isShuffle: false,
  type: "youtube_radio",
};

export const YoutubeRadioConfig = {
  getAllPlaylists(): PrimitivePlaylist[] {
    const rawConfig = configFile.get(
      "playlists",
      []
    ) as Array<PrimitivePlaylist>;

    const playlists = rawConfig.filter((pl) => {
      return [
        pl.videos.length > 0,
        pl.name.length > 0,
        pl.type === "youtube" ? pl.playlistID.length > 0 : true,
      ].reduce((previous, current) => previous && current);
    });
    return playlists;
  },
  getPlaylist(name: string): PrimitivePlaylist {
    return YoutubeRadioConfig.getAllPlaylists().find((e) => e.name === name);
  },
  setAllPlaylists(playlists: PrimitivePlaylist[]) {
    configFile.set("playlists", playlists);
  },
  setPlaylist(playlist: PrimitivePlaylist) {
    if (!playlist.name.length || !playlist.videos.length) {
      return;
    }
    const playlists = YoutubeRadioConfig.getAllPlaylists();
    if (YoutubeRadioConfig.isAlreadyExistPlaylist(playlist.name)) {
      playlists[playlists.findIndex((e) => e.name === playlist.name)] =
        playlist;
    } else {
      playlists.push(playlist);
    }

    configFile.set("playlists", playlists);
  },
  isAlreadyExistPlaylist(name: string): boolean {
    return YoutubeRadioConfig.getAllPlaylists()
      .map((e) => e.name)
      .includes(name);
  },
  deletePlaylist(name: string) {
    const playlists = YoutubeRadioConfig.getAllPlaylists();
    playlists.splice(playlists.findIndex((e) => e.name === name, 1));
    configFile.set("playlists", playlists);
  },
  getVolume(): number {
    const volume = configFile.get("volume", 50) as number;
    return volume;
  },
  setVolume(volume: number) {
    configFile.set("volume", volume);
  },
  async editPlaylistAndSave(
    playlistName: string,
    newPlaylist: PrimitivePlaylist
  ) {
    const playlists = YoutubeRadioConfig.getAllPlaylists();
    const bufferPlaylist = Playlist.toPlaylist(
      newPlaylist.type,
      playlists.find((e) => e.name === playlistName) ??
        ((defaultPlaylist.type = newPlaylist.type), defaultPlaylist)
    );
    await bufferPlaylist.applyPlaylist(newPlaylist);
    if (YoutubeRadioConfig.isAlreadyExistPlaylist(playlistName)) {
      playlists[playlists.findIndex((e) => e.name === playlistName)] =
        bufferPlaylist;
    } else {
      playlists.push(bufferPlaylist);
    }

    YoutubeRadioConfig.setAllPlaylists(playlists);
  },
};

export type PrimitivePlaylist = {
  type: playlistTypes;
  name: string;
  videos: YoutubeVideo[];
  isShuffle: boolean;
  playlistID?: string;
};

export type YoutubeVideo = {
  id: string;
  title: string;
};

export class Playlist implements PrimitivePlaylist {
  type: playlistTypes;
  videos: YoutubeVideo[];
  isShuffle: boolean;
  name: string;

  static toPlaylist<KEY extends keyof _playlistTypes>(
    type: KEY,
    pl: PrimitivePlaylist
  ): _playlistTypes[KEY] {
    if (type === "youtube") {
      return new YoutubePlaylist(pl) as _playlistTypes[KEY];
    } else if (type === "youtube_radio") {
      return new YoutubeRadioPlaylist(pl) as _playlistTypes[KEY];
    } else if (type === "single_video") {
      return new SingleVideoPlaylist(pl) as _playlistTypes[KEY];
    }
  }

  constructor(prmPlaylist: PrimitivePlaylist) {
    this.name = prmPlaylist.name;
    this.isShuffle = prmPlaylist.isShuffle;
    this.videos = prmPlaylist.videos;
    this.type = prmPlaylist.type;
  }

  applyPlaylist(pl: PrimitivePlaylist): Promise<void> {
    this.name = pl.name;
    this.isShuffle = pl.isShuffle;
    return this.updateVideos(pl.videos);
  }

  protected async updateVideos(newVideoList: YoutubeVideo[]): Promise<void> {
    const currentVideoListID = this.videos.map((e) => e.id);
    const newVideoListID = newVideoList.map((e) => e.id);
    const difference = diff.diffArrays(currentVideoListID, newVideoListID);
    let index = 0;

    for (const diffOperation of difference) {
      if (diffOperation.added) {
        for (const _ of diffOperation.value) {
          newVideoList[index].title = await youtube.getTitle(
            newVideoList[index].id
          );
          this.videos.splice(index, 0, newVideoList[index]);
          index++;
        }
      } else if (diffOperation.removed) {
        diffOperation.value.forEach(() => {
          this.videos.splice(index, 1);
        });
      } else {
        diffOperation.value.forEach(() => {
          index++;
        });
      }
    }
  }

  toPrimitivePlaylist(): PrimitivePlaylist {
    return {
      ...this,
    };
  }
}

export class YoutubePlaylist extends Playlist {
  type: playlistTypes = "youtube";
  playlistID: string;

  constructor(prmPlaylist: PrimitivePlaylist) {
    super(prmPlaylist);
    this.playlistID = prmPlaylist.playlistID;
  }

  async applyPlaylist(pl: PrimitivePlaylist): Promise<void> {

    if (this.playlistID !== pl.playlistID) {
      console.log("change playlist id");
      this.name = pl.name;
      this.isShuffle = pl.isShuffle;
      await this.updatePlaylistID(pl.playlistID);
    } else {
      console.log("change video list");
      await super.applyPlaylist(pl);
    }
  }
  private async updatePlaylistID(ID: string) {
    this.videos = await youtube.getAllVideoFromYoutubePlaylistID(ID);
    this.playlistID = ID;
  }
}

export class YoutubeRadioPlaylist extends Playlist {
  type: playlistTypes = "youtube_radio";
  constructor(prmPlaylist: PrimitivePlaylist) {
    super(prmPlaylist);
  }
  protected async updateVideos(newVideoList: YoutubeVideo[]): Promise<void> {
    return super.updateVideos(newVideoList);
  }
}

export class SingleVideoPlaylist extends Playlist {
  type: playlistTypes = "single_video";
  constructor(prmPlaylist: PrimitivePlaylist) {
    super(prmPlaylist);
    this.name = this.videos[0].title;
  }
  protected async updateVideos(newVideoList: YoutubeVideo[]): Promise<void> {
    await super.updateVideos(newVideoList);
    this.name = this.videos[0].title;
  }
}
