import * as React from 'react';
import { ContextAppState, ContextDispatchAppState, preload } from "../main";
import { getYoutubeThumbnailURLFromID, pushDisplayWithAnimation } from '../utils';
import { PrimitivePlaylist } from "../../../lib/config";
import { IconedButton, Wrapper, Thumbnail } from '.';
import { loadPlaylist, navigatePlaylist } from "../utils";

declare const window: preload

const PlaylistDisplay: React.FC<{ playlist: PrimitivePlaylist, index: number }> = (props) => {
   const playlistThumbnailSrc = getYoutubeThumbnailURLFromID((props.playlist.videos[0] ?? { id: '' }).id)
   const dispatch = React.useContext(ContextDispatchAppState)
   return (
      <div className="playlist-display">
         <Thumbnail src={playlistThumbnailSrc} className="thumbnail"></Thumbnail>
         <div
            className="playlist-title-display"
            onClick={() => {
               pushDisplayWithAnimation(dispatch, 'playlist-detail')
               dispatch({
                  type: 'set-target-playlist',
                  props: props.playlist
               })
            }}>
            {props.playlist.name}
         </div>
         <IconedButton
            iconName="play"
            className="play-button"
            onClick={() => {
               loadPlaylist(props.playlist.name)
               navigatePlaylist({
                  shuffle: props.playlist.isShuffle
               })
               dispatch({
                  type: 'close-window'
               })
            }} />
      </div >
   )
}

const PlaylistsDisplay: React.FC<{ index: number }> = (props) => {
   const appState = React.useContext(ContextAppState)
   const dispatch = React.useContext(ContextDispatchAppState)
   return (
      <Wrapper wrapTarget='playlist-display-wrapper' index={props.index}>
         <div id="playlists-display">
            {appState.playlists.map(playlist => <PlaylistDisplay playlist={playlist} index={props.index} key={playlist.name} />)}
            <ButtonCreatePlaylist />
         </div>
         <IconedButton
            iconName="close"
            id="close-window"
            onClick={() => {
               dispatch({
                  type: 'close-window'
               })
            }} />
         <ButtonPinPlayer />
      </Wrapper>
   )
}

export default PlaylistsDisplay;




const ButtonCreatePlaylist: React.FC = () => {
   const dispatch = React.useContext(ContextDispatchAppState)

   return (
      <div className='button-create-playlist' onClick={() => {
         pushDisplayWithAnimation(dispatch, 'playlist-type-selection')
      }}>
         <i className='fas fa-plus plus-icon'></i>
         <div id="new-playlist-text">プレイリストを作成</div>
      </div>
   )
}

const ButtonPinPlayer: React.FC = () => {
   const [isPinned, setIsPinned] = React.useState<boolean>(false)
   React.useEffect(() => {
      (async () => {
         const isPinned = await window.YoutubeRadio.isPinned()
         setIsPinned(isPinned)
      })()
   })
   return (
      <IconedButton
         iconName="pin"
         id="button-pin-player"

         onClick={async () => {
            const isPinned = await window.YoutubeRadio.pinPlayer()
            setIsPinned(isPinned)
         }}

         style={{
            color: isPinned ? "#353535" : "#909090"
         }}
      />
   )
}
