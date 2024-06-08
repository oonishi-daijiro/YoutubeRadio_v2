import * as React from 'react'
import { ContextDispatchAppState } from '../main'
import { pushDisplayWithAnimation, popDisplayWithAnimation } from '../utils'
import { IconedButton, Wrapper } from '.'
import { type YoutubePlaylist } from '../../../lib/config'


export const PlaylistTypeSelection: React.FC<{ index: number }> = (props) => {
  const dispatch = React.useContext(ContextDispatchAppState)

  function pushEditorWithAnimation(plType: YoutubePlaylist['type']): void {
    const videos: YoutubePlaylist['videos'] = plType === 'youtube' ? [] : [{ id: '', title: '' }]
    dispatch({
      type: 'set-target-playlist',
      props: {
        name: '',
        type: plType,
        videos,
        isShuffle: false
      }
    })
    pushDisplayWithAnimation(dispatch, 'playlist-editor')
  }

  return (
    <Wrapper wrapTarget="playlist-type-selection-wrapper" index={props.index}>
      <div id="selection-and-description">
        <div id="selections">
          <div className="selection" onClick={() => {
            pushEditorWithAnimation('youtube_radio')
          }}>
            <IconedButton iconName="list" className='selectionIcon'></IconedButton>
          </div>
          <div className="selection" onClick={() => {
            pushEditorWithAnimation('youtube')
          }}>
            <IconedButton iconName="cloud" className='selectionIcon' />
          </div>
        </div>
      </div>
      <IconedButton iconName="arrowLeft" className="button-back" onClick={() => {
        popDisplayWithAnimation(dispatch)
      }} />
    </Wrapper>
  )
}

export default PlaylistTypeSelection
