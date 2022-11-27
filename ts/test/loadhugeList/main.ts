import { getPlaylists } from "../../lib/config/main";

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
document.getElementById('pause').className = 'fas fa-play';
let player; //youtube iframe api instance will be here;


async function onYouTubeIframeAPIReady() {
  const playlists = getPlaylists()
  const ids = playlists[0].videos.map(e => {
    return e.id;
  });
  console.log(ids);
  player = new YT.Player('player', {
    height: '300',
    width: '288',
    events: {
      onReady: playerOnReady,
      onError: (err) => {
        console.log("Error:", err);
      }
    }
  });
}

function playerOnReady() {
}
