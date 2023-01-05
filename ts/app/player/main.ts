import { Playlist, YoutubePlaylist, YoutubeRadioPlaylist, YoutubeVideo } from "../../lib/config/main";
import YoutubeRadioPreload from "../../preload/player/preload";
import { playlistNavigation } from "../../preload/playlist/preload";

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
document.getElementById('pause').className = 'fas fa-play'
let player: YT.Player//youtube iframe api instance will be here;

const currentState = {
  id: "",
  playlistName: "",
  playlistID: ""
}

interface preload extends Window {
  YoutubeRadio: YoutubeRadioPreload
}

declare const window: preload

declare global {
  namespace YT {
    interface Player {
      loadPlaylist(parm: loadPlaylistParm)
    }
  }
}

window.addEventListener('load', () => {
  stopServer()
  window.YoutubeRadio.emitWindowGetReady()
})

function stopServer(): void {
  const parm: Record<string, string> = {
    "loaded": "true"
  }
  const url = `${location.href}?${new URLSearchParams(parm)}`
  fetch(url, {
    method: "GET"
  })
}

function onYouTubeIframeAPIReady() { // when youtube iframe api get ready, this function will call
  player = new YT.Player('player', {
    height: '300',
    width: '288',
    events: {
      onStateChange: (stat) => {
        switch (stat.data) {
          case 1:
            window.YoutubeRadio.emitPlayerStartPlaying()
            break;
        }
      },
      onReady: playerOnReady,
      onError: (err) => {
        setTimeout(() => {
          player.nextVideo()
        }, 2500);
        console.error("Error:", err)
      }
    },
    host: 'https://www.youtube-nocookie.com'
  })
}

async function getPlaylists(): Promise<Playlist[]> {
  return await window.YoutubeRadio.getPlaylists()
}

window.YoutubeRadio.onReqNavigation(async (navigation: playlistNavigation) => {

  const playlist = (await getPlaylists()).find(e => {
    return e.name === navigation.name
  })
  playlist.isShuffle = navigation.shuffle
  loadPlaylist(playlist, navigation.index)
})

window.YoutubeRadio.onLoadPlaylist(async (playlistName: string) => {
  const playlist = (await getPlaylists()).find(e => {
    return e.name === playlistName
  })
  loadPlaylist(playlist)
})

interface loadPlaylistParm {
  listType?: string
  list?: string | string
  playlist?: string[] | string
  index?: number
  startSeconds?: number
  suggestedQuality?: string
}

async function loadPlaylist(appliedPlaylist: Playlist, index: number = 0) {

  if (!appliedPlaylist || !appliedPlaylist.name) {
    return
  }

  const conditions: Array<boolean> = [
    currentState.id === appliedPlaylist.videos[index].id,
    currentState.playlistName === appliedPlaylist.name,
    appliedPlaylist.playlistID ? currentState.playlistID === appliedPlaylist.playlistID : true
  ]

  conditions.forEach((tf, index) => {
    console.log(`${index}${tf}`);

  })
  player.setShuffle(false)


  if (conditions.reduce((p, c) => p && c)) return

  player.stopVideo()



  if (appliedPlaylist.type === "youtube") {

    player.loadPlaylist({
      listType: "playlist",
      list: appliedPlaylist.playlistID,
      index: index,
      startSeconds: 0
    })
    await window.YoutubeRadio.onPlayerStartPlaying()
    const videos = player.getPlaylist().map(
      id => {
        return {
          id: id,
          title: ""
        }
      })
    appliedPlaylist.videos = videos
    window.YoutubeRadio.editPlaylist(appliedPlaylist.name, appliedPlaylist)
  } else if (appliedPlaylist.type === "youtube_radio") {
    if (!appliedPlaylist || !appliedPlaylist.name || !appliedPlaylist.videos) {
      return
    }
    const idList: string[] = appliedPlaylist.videos.map(e => {
      return e.id
    })
    player.loadPlaylist({
      listType: "playlist",
      playlist: idList,
      index: index,
      startSeconds: 0
    })
  }
  player.setLoop(true)

  currentState.id = appliedPlaylist.videos[index].id;
  currentState.playlistID = appliedPlaylist.playlistID ?? ""
  currentState.playlistName = appliedPlaylist.name

  player.setShuffle(appliedPlaylist.isShuffle)
}

async function playerOnReady() {
  const volume = await window.YoutubeRadio.getVolume()
  const [playlist] = await getPlaylists()
  loadPlaylist(playlist)
  setVolume(volume)
}


window.YoutubeRadio.onVideoPlayed(() => {
  pauseButton.className = "fas fa-pause"
  soundBars.forEach(element => {
    element.style.animationPlayState = 'running'
  })
})

window.YoutubeRadio.onVideoPaused(() => {
  pauseButton.className = "fas fa-play"
  soundBars.forEach(element => {
    element.style.animationPlayState = 'paused'
  });
})

window.YoutubeRadio.onReqPauseVideo(() => {
  pauseVideo()
})
window.YoutubeRadio.onReqPlayVideo(() => {
  playVideo()
})

window.YoutubeRadio.onReqPreviousVideo(() => {
  previousVideo()
})

window.YoutubeRadio.onNextVideo(() => {
  nextVideo()
})


function nextVideo() {
  player.nextVideo()
}

function previousVideo() {
  player.previousVideo()
}

function pauseVideo() {
  pauseButton.className = "fas fa-play"
  soundBars.forEach(element => {
    element.style.animationPlayState = 'paused'
  });
  player.pauseVideo()
}

function playVideo() {
  pauseButton.className = "fas fa-pause"
  soundBars.forEach(element => {
    element.style.animationPlayState = 'running'
  })
  player.playVideo()
}


const buttonOpenSelectPlaylist = document.getElementById('getUrl')

buttonOpenSelectPlaylist.addEventListener('click', () => {
  window.YoutubeRadio.openSelectPlaylistWindow()
})


const pauseButton = document.getElementById('pause')

pauseButton.addEventListener('click', () => {
  if (player.getPlaylist() === null) { // when the player didnt has any playlist
    return
  }
  if (pauseButton.className === "fas fa-pause") {
    pauseVideo();
  } else {
    playVideo();
  }
}, false)

const buttonPreviousVideo = document.getElementById('previousVideo')

buttonPreviousVideo.addEventListener('click', () => { //when the player didnt has any playlist
  if (player.getPlaylist() === null) {
    return
  }
  previousVideo()
})

const buttonNextVideo = document.getElementById('nextVideo')

buttonNextVideo.addEventListener('click', () => { //when the player didnt has any playlist
  if (player.getPlaylist() === null) {
    return
  }
  nextVideo()
}, false)

const buttonVolume = document.getElementById('volume')

buttonVolume.addEventListener('click', () => {
  buttonVolume.style.display = 'none'
  canvas.style.display = 'block'
  let volume_num = 50 - player.getVolume() / 2
  field.fillStyle = '#444444';
  field.fillRect(0, volume_num, canvas.width, canvas.height);
}, false)

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const field = canvas.getContext('2d')

function setVolumeBar(volume: number) {
  if (volume > 100) {
    volume = 100
  }
  const relativeVolume = volume / 100
  field.fillStyle = '#444444';
  field.clearRect(0, 0, canvas.width, relativeVolume + 50)
  field.fillRect(0, canvas.height, canvas.width, (-relativeVolume) * canvas.height);
  if (volume === 0) {
    buttonVolume.className = 'fas fa-volume-mute'
  } else if (0 < volume && volume < 50) {
    buttonVolume.className = 'fas fa-volume-down'
  } else if (50 < volume) {
    buttonVolume.className = 'fas fa-volume-up'
  }
}

function setVolume(volume: number) {
  setVolumeBar(volume)
  player.setVolume(volume)
}

canvas.addEventListener('click', (event) => {
  if (event.which === 1) {
    setVolume(100 - event.offsetY * 2)
  }
}, false);

canvas.addEventListener('mousemove', (event) => {
  if (event.which === 1) {
    setVolume(100 - event.offsetY * 2)
  }
}, false);

canvas.addEventListener('mouseup', () => {
  setTimeout(() => {
    canvas.style.display = 'none'
    buttonVolume.style.display = 'block'
  }, 500);
}, false)

canvas.addEventListener('mouseout', () => {
  setTimeout(() => {
    canvas.style.display = 'none'
    buttonVolume.style.display = 'block'
  }, 500);
}, false)

const soundBars = []
const bars = document.getElementsByClassName('bars')
Array.from(bars).forEach((e) => {
  soundBars.push(e)
})

const closeButton = document.getElementById('close_button')

closeButton.addEventListener('click', async () => {
  await window.YoutubeRadio.saveVolume(player.getVolume())
  window.YoutubeRadio.close()
}, false)

const minimize = document.getElementById('minimize')

minimize.addEventListener('click', () => {
  window.YoutubeRadio.minimize()
}, false)
