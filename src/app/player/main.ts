<<<<<<< Updated upstream
import {
  defaultPlaylist,
  type Playlist,
  type PrimitivePlaylist,
} from "../../lib/config";
import type YoutubeRadioPreload from "../../preload/player";
import { type playlistNavigation } from "../../preload/playlist";
=======
import { Playlist, PrimitivePlaylist } from "../../lib/config";
import YoutubeRadioPreload from "../../preload/player";
import { playlistNavigation } from "../../preload/playlist";
>>>>>>> Stashed changes

const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
document.getElementById("pause")!.className = "fas fa-play";
let player: YT.Player; // youtube iframe api instance will be here;

interface preload extends Window {
  YoutubeRadio: YoutubeRadioPreload;
  player: YT.Player;
  onYouTubeIframeAPIReady: () => void;
}

declare const window: preload;

<<<<<<< Updated upstream
declare global {
  namespace YT {
    interface Player {
      loadPlaylist(parm: loadPlaylistParm): void;
    }
  }
}
=======
declare const YT: {
  Player: new (p: string, pp: unknown) => YT.Player;
};
>>>>>>> Stashed changes

window.addEventListener("load", () => {
  stopServer();
  window.YoutubeRadio.emitWindowGetReady();
});

function stopServer(): void {
  const parm: Record<string, string> = {
    loaded: "true",
  };
  const url = `${location.href}?${new URLSearchParams(parm)}`;
  fetch(url, {
    method: "GET",
  });
}

window.onYouTubeIframeAPIReady = function () {
  // when youtube iframe api get ready, this function will call
  player = new YT.Player("player", {
    height: "300",
    width: "288",
    events: {
      onStateChange: (stat) => {
        switch (stat.data) {
          case 1:
            window.YoutubeRadio.emitPlayerStartPlaying();
            break;
        }
      },
      onReady: playerOnReady,
      onError: (err) => {
        setTimeout(() => {
          player.nextVideo();
        }, 2500);
        console.error("iframe api Error:", err);
      },
    },
    host: "https://www.youtube-nocookie.com",
  });
  window.player = player;
};

async function getPlaylists(): Promise<Playlist[]> {
  return await window.YoutubeRadio.getPlaylists();
}

window.YoutubeRadio.onReqNavigation(
  async (
    navigation: playlistNavigation = {
      shuffle: false,
    }
  ) => {
    player.setShuffle(navigation.shuffle);
  }
);

window.YoutubeRadio.onLoadPlaylist(
  async (arg: { name: string; index: number }) => {
    const playlist = (await getPlaylists()).find((e) => e.name === arg.name);
    loadPlaylist(playlist ?? defaultPlaylist, arg.index);
  }
);

interface loadPlaylistParm {
  listType?: string;
  list?: string | string;
  playlist?: string[] | string;
  index?: number;
  startSeconds?: number;
  suggestedQuality?: string;
}

async function loadPlaylist(appliedPlaylist: PrimitivePlaylist, index: number) {
  if (!appliedPlaylist?.name) {
    return;
  }
  player.setShuffle(false);
  player.stopVideo();

  if (appliedPlaylist.type === "youtube") {
    player.loadPlaylist({
      listType: "playlist",
      list: appliedPlaylist.playlistID,
      index,
      startSeconds: 0,
    });
    await window.YoutubeRadio.onPlayerStartPlaying();
    const videos = player.getPlaylist().map((id) => {
      return {
        id,
        title: "",
      };
    });

    if (videos.length === 0) return;
    appliedPlaylist.videos = videos;
    window.YoutubeRadio.editPlaylist(appliedPlaylist.name, appliedPlaylist); // For update playlist without using api key
  } else if (appliedPlaylist.type === "youtube_radio") {
    if (!appliedPlaylist?.name || !appliedPlaylist.videos) {
      return;
    }
    const idList: string[] = appliedPlaylist.videos.map((e) => {
      return e.id;
    });
    (player.loadPlaylist as (parm: loadPlaylistParm) => void)({
      listType: "playlist",
      playlist: idList,
      index,
      startSeconds: 0,
    });
  }

  player.setLoop(true);
  player.setShuffle(appliedPlaylist.isShuffle);
}

async function playerOnReady() {
  const volume = await window.YoutubeRadio.getVolume();
  const [playlist] = await getPlaylists();
  loadPlaylist(playlist, 0);
  setVolume(volume);
}

window.YoutubeRadio.onVideoPlayed(() => {
  pauseButton!.className = "fas fa-pause";
  soundBars.forEach((element) => {
    element.style.animationPlayState = "running";
  });
});

window.YoutubeRadio.onVideoPaused(() => {
  pauseButton!.className = "fas fa-play";
  soundBars.forEach((element) => {
    element.style.animationPlayState = "paused";
  });
});

window.YoutubeRadio.onReqPauseVideo(() => {
  pauseVideo();
});
window.YoutubeRadio.onReqPlayVideo(() => {
  playVideo();
});

window.YoutubeRadio.onReqPreviousVideo(() => {
  previousVideo();
});

window.YoutubeRadio.onNextVideo(() => {
  nextVideo();
});

function nextVideo() {
  player.nextVideo();
}

function previousVideo() {
  player.previousVideo();
}

function pauseVideo() {
  pauseButton!.className = "fas fa-play";
  soundBars.forEach((element) => {
    element.style.animationPlayState = "paused";
  });
  player.pauseVideo();
}

function playVideo() {
  pauseButton!.className = "fas fa-pause";
  soundBars!.forEach((element) => {
    element.style.animationPlayState = "running";
  });
  player.playVideo();
}

const buttonOpenSelectPlaylist = document.getElementById("getUrl");

<<<<<<< Updated upstream
buttonOpenSelectPlaylist!.addEventListener("click", async (event) => {
=======
buttonOpenSelectPlaylist.addEventListener("click", async () => {
>>>>>>> Stashed changes
  await window.YoutubeRadio.openSelectPlaylistWindow();
});

const pauseButton = document.getElementById("pause");

pauseButton!.addEventListener(
  "click",
  () => {
    if (player.getPlaylist() === null) {
      // when the player didnt has any playlist
      return;
    }
    if (pauseButton!.className === "fas fa-pause") {
      pauseVideo();
    } else {
      playVideo();
    }
  },
  false
);

const buttonPreviousVideo = document.getElementById("previousVideo");

buttonPreviousVideo!.addEventListener("click", () => {
  // when the player didnt has any playlist
  if (player.getPlaylist() === null) {
    return;
  }
  previousVideo();
});

const buttonNextVideo = document.getElementById("nextVideo");

buttonNextVideo!.addEventListener(
  "click",
  () => {
    // when the player didnt has any playlist
    if (player.getPlaylist() === null) {
      return;
    }
    nextVideo();
  },
  false
);

const buttonVolume = document.getElementById("volume");

buttonVolume!.addEventListener(
  "click",
  () => {
    buttonVolume!.style.display = "none";
    canvas.style.display = "block";
    const volume_num = 50 - player.getVolume() / 2;
<<<<<<< Updated upstream
    field!.fillStyle = "#444444";
    field!.fillRect(0, volume_num, canvas.width, canvas.height);
=======
    field.fillStyle = "#444444";
    field.fillRect(0, volume_num, canvas.width, canvas.height);
>>>>>>> Stashed changes
  },
  false
);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const field = canvas.getContext("2d");

function setVolumeBar(volume: number) {
  if (volume > 100) {
    volume = 100;
  }
  const relativeVolume = volume / 100;
  field!.fillStyle = "#444444";
  field!.clearRect(0, 0, canvas.width, relativeVolume + 50);
  field!.fillRect(
    0,
    canvas.height,
    canvas.width,
    -relativeVolume * canvas.height
  );
  if (volume === 0) {
    buttonVolume!.className = "fas fa-volume-mute";
  } else if (volume > 0 && volume < 50) {
    buttonVolume!.className = "fas fa-volume-down";
  } else if (volume > 50) {
    buttonVolume!.className = "fas fa-volume-up";
  }
}

function setVolume(volume: number) {
  setVolumeBar(volume);
  player.setVolume(volume);
}

canvas.addEventListener(
  "click",
  (event) => {
    if (event.which === 1) {
      setVolume(100 - event.offsetY * 2);
    }
  },
  false
);

canvas.addEventListener(
  "mousemove",
  (event) => {
    if (event.which === 1) {
      setVolume(100 - event.offsetY * 2);
    }
  },
  false
);

canvas.addEventListener(
  "mouseup",
  () => {
    setTimeout(() => {
      canvas.style.display = "none";
      buttonVolume!.style.display = "block";
    }, 500);
  },
  false
);

canvas.addEventListener(
  "mouseout",
  () => {
    setTimeout(() => {
      canvas.style.display = "none";
      buttonVolume!.style.display = "block";
    }, 500);
  },
  false
);

const soundBars: HTMLElement[] = [];
const bars = document.getElementsByClassName("bars");
Array.from(bars).forEach((e) => {
  soundBars.push(e as HTMLElement);
});

const closeButton = document.getElementById("close_button");

closeButton!.addEventListener(
  "click",
  async () => {
    await window.YoutubeRadio.saveVolume(player.getVolume());
    window.YoutubeRadio.close();
  },
  false
);

const minimize = document.getElementById("minimize");

minimize!.addEventListener(
  "click",
  () => {
    window.YoutubeRadio.minimize();
  },
  false
);
