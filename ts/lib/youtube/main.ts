import * as https from "https";
import { parse } from "url";
import { getapikey } from "../youtube_api_key/main";
import { ParsedUrlQueryInput, stringify } from "querystring";
import { Playlist, YoutubeVideo } from "../config/main";

async function getHTML(url: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    https.get(url, response => {
      let data = ''
      response.on('data', chunk => {
        data += chunk
      })
      response.on('end', () => {
        resolve(data)
      })
      response.on('error', error => {
        console.log(error);
        reject(error)
      })
    })
  })
}

export function getID(youtubeURL: string): string {
  const queryParms = parse(youtubeURL, true)
  const id = queryParms.query.v
  return id as string
}

async function getHTMLtitle(url: string): Promise<string> {
  const titleParser = new RegExp('(?<=<title.*>).*(?=</title>)')
  const html = await getHTML(url)
  const rawTitle = Array.from(titleParser.exec(html)[0])
  const title = rawTitle.splice(0, rawTitle.length - 10).join('')
  return title
}

export async function getTitle(ID: string = ""): Promise<string> {
  if (ID === "" || ID.length != 11) {
    return ""
  }
  try {
    const title = await getHTMLtitle(`https://www.youtube.com/watch?v=${ID}`)
    return title

  } catch (err) {
    return ""
  }
}

export function getPlaylistID(url: string): string {
  return parse(url, true).query.list as string
}

export async function getAllVideoFromYoutubePlaylistID(id: string): Promise<YoutubeVideo[]> {
  console.log("API used");

  if (id.length !== 34) {
    return []
  }
  interface YoutubeDataApiQuery extends ParsedUrlQueryInput {
    key: string
    playlistId: string
    maxResults: number
    part: string
    pageToken?: string
  }
  const query: YoutubeDataApiQuery = {
    key: getapikey(),
    playlistId: id,
    maxResults: 50,
    part: 'snippet',
  }

  async function getVideos(videos: YoutubeVideo[] = [], nextPageToken: string = undefined): Promise<YoutubeVideo[]> {


    if (nextPageToken !== undefined) {
      query.pageToken = nextPageToken
    }
    const url = 'https://www.googleapis.com/youtube/v3/playlistItems?' + stringify(query)
    const response: string = await new Promise((resolve, reject) => {
      let data: string = ""

      https.get(url, res => {

        res.on('data', chunk => {
          data += chunk
        })
        res.on('end', () => {
          resolve(data)
        })
        res.on('error', () => {
          reject()
        })
      })
    })


    const jsonResult = JSON.parse(response)


    if (jsonResult.items) {
      JSON.parse(response).items.forEach(item => {
        const title = item.snippet.title
        if (title === "Deleted video") {
          return
        }
        const id = item.snippet.resourceId.videoId
        videos.push(new YoutubeVideo({
          id: id,
          title: title
        }))
      })
    }
    if (jsonResult.nextPageToken !== undefined) {
      return getVideos(videos, jsonResult.nextPageToken)
    }

    return videos
  }
  return await getVideos()
}

export function isPlaylistURL(url: string): boolean {
  const u = parse(url, true)
  return Boolean(u.query.list) && u.query.list.length === 34
}
