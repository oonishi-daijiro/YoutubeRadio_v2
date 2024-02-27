import * as React from 'react';
import { ContextDispatchAppState, preload } from "../main";
import { pushDisplayWithAnimation, popDisplayWithAnimation } from '../utils';
import { IconedButton, Wrapper } from '.';
import { YoutubePlaylist } from "../../../lib/config";

declare const window: preload

export const PlaylistTypeSelection: React.FC<{ index: number }> = (props) => {
   const dispatch = React.useContext(ContextDispatchAppState)

   function pushEditorWithAnimation(plType: YoutubePlaylist['type']) {
      const videos: YoutubePlaylist['videos'] = plType === 'youtube' ? [] : [{ id: "", title: "" }]
      dispatch({
         type: 'set-target-playlist',
         props: {
            name: '',
            type: plType,
            videos: videos,
            isShuffle: false
         }
      })
      pushDisplayWithAnimation(dispatch, 'playlist-editor')
   }

   return (
      <Wrapper wrapTarget="playlist-type-selection-wrapper" index={props.index}>
         <div id="selection-and-description">
            <div id="label-selection-description">タイプを選択</div>
            <div id="selections">
               <div className="selection" onClick={() => {
                  pushEditorWithAnimation('youtube_radio')
               }}>
                  <img src="./youtube_radio.svg" id="icon-youtube-radio"></img>
               </div>
               <div className="selection" onClick={() => {
                  pushEditorWithAnimation('youtube')
               }}>
                  <IconedButton iconName="iconYoutube" id="iconYoutube" />
               </div>
            </div>
         </div>
         <IconedButton iconName="arrowLeft" className="button-back" onClick={() => {
            popDisplayWithAnimation(dispatch)
         }} />
      </Wrapper>
   )
}

export default PlaylistTypeSelection;
