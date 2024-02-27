import type { Playlist, PrimitivePlaylist } from "../../lib/config";
import type YoutubeRadioPreload from "../../preload/player";
import { type playlistNavigation } from "../../preload/playlist";

const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
let player: YT.Player; // youtube iframe api instance will be here;

interface preload extends Window {
  YoutubeRadio: YoutubeRadioPreload;
  player: YT.Player;
  onYouTubeIframeAPIReady: () => void;
}

declare const window: preload;
declare const YT: {
  Player: new (p: string, pp: unknown) => YT.Player;
};

window.addEventListener("load", () => {
  window.YoutubeRadio.emitWindowGetReady();
});

window.onYouTubeIframeAPIReady = function () {
  // when youtube iframe api get ready, this function will call
  player = new YT.Player("player", {
    height: "300",
    width: "288",
    events: {
      onStateChange: (stat: YT.OnStateChangeEvent) => {
        switch (stat.data) {
          case 1:
            window.YoutubeRadio.emitPlayerStartPlaying();
            break;
        }
      },
      onReady: playerOnReady,
      onError: (err: YT.OnErrorEvent) => {
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
  (
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
    await loadPlaylist(playlist as PrimitivePlaylist, arg.index);
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

async function loadPlaylist(
  appliedPlaylist: PrimitivePlaylist,
  index: number
): Promise<void> {
  if ((appliedPlaylist?.name).length === 0) {
    return;
  }
  player.setShuffle(false);
  player.stopVideo();

  if (appliedPlaylist.type === "youtube") {
    (player.loadPlaylist as (parm: loadPlaylistParm) => void)({
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
    await window.YoutubeRadio.editPlaylist(
      appliedPlaylist.name,
      appliedPlaylist
    ).catch((err): void => {
      console.log(err);
    }); // For update playlist without using api key
  } else if (appliedPlaylist.type === "youtube_radio") {
    if (
      !(appliedPlaylist?.name === "") ||
      !(appliedPlaylist.videos.length === 0)
    ) {
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

async function playerOnReady(): Promise<void> {
  const volume = await window.YoutubeRadio.getVolume();
  const [playlist] = await getPlaylists();
  await loadPlaylist(playlist, 0);
  setVolume(volume);
}

window.YoutubeRadio.onVideoPlayed(() => {
  pauseButton!.className = "fas fa-pause";
  soundBars.forEach((element) => {
    (element as HTMLElement).style.animationPlayState = "running";
  });
});

window.YoutubeRadio.onVideoPaused(() => {
  pauseButton!.className = "fas fa-play";
  soundBars.forEach((element) => {
    (element as HTMLElement).style.animationPlayState = "paused";
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

function nextVideo(): void {
  player.nextVideo();
}

function previousVideo(): void {
  player.previousVideo();
}

function pauseVideo(): void {
  pauseButton!.className = "fas fa-play";
  soundBars.forEach((element) => {
    (element as HTMLElement).style.animationPlayState = "paused";
  });
  player.pauseVideo();
}

function playVideo(): void {
  pauseButton!.className = "fas fa-pause";
  soundBars.forEach((element) => {
    (element as HTMLElement).style.animationPlayState = "running";
  });
  player.playVideo();
}

const buttonOpenSelectPlaylist = document.getElementById("getUrl");

buttonOpenSelectPlaylist!.addEventListener("click", async (event) => {
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
    const vokumeNum = 50 - player.getVolume() / 2;
    field!.fillStyle = "#444444";
    field!.fillRect(0, vokumeNum, canvas.width, canvas.height);
  },
  false
);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const field = canvas.getContext("2d");

function setVolumeBar(volume: number): void {
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

function setVolume(volume: number): void {
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

const bars = document.getElementsByClassName("bars");
const soundBars: Element[] = Array.from(bars);

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
