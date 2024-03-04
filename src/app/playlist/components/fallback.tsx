import * as React from 'react';
import { type preload } from "../main"
import { IconedButton, Wrapper } from "../components";


declare const window: preload;

const Fallback: React.FC = () => {
   return (
      <Wrapper wrapTarget='playlist-display-wrapper' index={0}>
         <div id="playlists-display">
            {[1, 2, 3].map(pl => <PendingPlaylistDisplay key={pl} />)}
         </div>
         <IconedButton onClick={() => { window.YoutubeRadio.close() }} iconName='close' id='close-window' />
         <IconedButton iconName='pin' id='button-pin-player' />
         <IconedButton iconName='reorder' id='button-reorder-playlists' />
      </Wrapper>
   )
};


const PendingPlaylistDisplayImpl: React.FC = () => {
   const getRandomWidth = (): number => {
      const min = 0;
      const max = 20;
      return min + (Math.random() * (max - min));
   }
   return (
      <div className="playlist-display playlist-display-pending" >
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
