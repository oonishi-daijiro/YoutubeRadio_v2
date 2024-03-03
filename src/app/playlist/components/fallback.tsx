import * as React from 'react';
import { ContextAppState, type preload } from "../main"
import { IconedButton, Wrapper } from "../components";
import type { PrimitivePlaylist } from "../../../lib/config";


declare const window: preload;

const Fallback: React.FC = () => {
   console.log("fallback");
   const appState = React.useContext(ContextAppState);
   return (
      <Wrapper wrapTarget='playlist-display-wrapper' index={0}>
         <div id="playlists-display">
            {appState.playlists.map(pl => <PendingPlaylistDisplay playlist={pl} key={pl.name} />)}
         </div>
         <IconedButton onClick={() => { window.YoutubeRadio.close() }} iconName='close' id='close-window' />
         <IconedButton iconName='pin' id='button-pin-player' />
         <IconedButton iconName='reorder' id='button-reorder-playlists' />
      </Wrapper>
   )
};


const PendingPlaylistDisplayImpl: React.FC<{ playlist: PrimitivePlaylist }> = (props) => {
   const getRandomWidth = (): number => {
      const min = 0;
      const max = 20;
      return min + (Math.random() * (max - min));
   }
   return (
      <div className="playlist-display playlist-display-pending" >
         {/* <Thumbnail src={playlistThumbnailSrc} className="thumbnail"></Thumbnail> */}
         <div className="thumbnail thumbnail-pending"></div>
         <div className="playlist-title-display playlist-title-display-pending">
            <div className='text-pending' style={{
               width: `${(60 + getRandomWidth()).toString()}%`,
            }}></div>
         </div>
      </div >
   )
}
const PendingPlaylistDisplay = React.memo(PendingPlaylistDisplayImpl);


export default Fallback;
