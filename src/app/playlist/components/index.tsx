<<<<<<< Updated upstream
import * as React from 'react'
import { ContextAppState } from '../main'
=======
import * as React from 'react';
import { ContextAppState } from "../main";
>>>>>>> Stashed changes

import PlaylistDetailDisplay from './playlist-detail'
import PlaylistEditorDisplay from './playlist-editor'
import PlaylistTypeSelection from './playlist-selection'
import PlaylistsDisplay from './playlists'


export const Icons = {
  pin: 'fas fa-thumbtack',
  play: 'fas fa-play',
  arrowLeft: 'fa-solid fa-arrow-left',
  note: 'fa-solid fa-music',
  shuffle: 'fa-solid fa-shuffle',
  pencil: 'fa-solid fa-pencil',
  trashBin: 'fa-solid fa-trash',
  save: 'fa-solid fa-floppy-disk',
  close: 'fas fa-times-circle',
  cross: 'fas fa-times',
  plusCircle: 'fas fa-plus-circle',
  iconYoutube: 'fa-brands fa-youtube'
} as const

<<<<<<< Updated upstream
export const IconedButton: React.FC<{ iconName: keyof typeof Icons } & JSX.IntrinsicElements['i']> = (props) => {
  const className = (props.className ?? "") + ` ${Icons[props.iconName]} `
  return <i {...props} className={className}></i >
=======

export const IconedButton: React.FC<{ iconName: keyof typeof Icons } & JSX.IntrinsicElements['i']> = (props) => {
   const className = ((props?.className) ?? "") + ` ${Icons[props.iconName]} `
   return <i  {...props} className={className}></i >
>>>>>>> Stashed changes
}
export const Wrapper: React.FC<{ wrapTarget: 'playlist-display-wrapper' | 'playlist-detail-display-wrapper' | 'playlist-editor-wrapper' | 'playlist-type-selection-wrapper', index: number, children: React.ReactNode[] | React.ReactNode }> = (props) => {
  const appState = React.useContext(ContextAppState)
  return <div id={props.wrapTarget} className={`${appState.switchAnimationHook[props.index]}`} style={{ pointerEvents: appState.isAnimating ? 'none' : 'auto' }}>{props.children}</div>
}

export const Thumbnail: React.FC<JSX.IntrinsicElements['img']> = (props) => {
  return <img {...props} style={{
    background: '#FFFFFF'
  }}></img>
}

export const FallBack: React.FC = () => {
  return <></>
}

export const Displays = {
  playlists: (index: number) => <PlaylistsDisplay index={index} />,
  'playlist-detail': (index: number) => <PlaylistDetailDisplay index={index} />,
  'playlist-editor': (index: number) => <PlaylistEditorDisplay index={index} />,
  'playlist-type-selection': (index: number) => <PlaylistTypeSelection index={index} />
} as const
