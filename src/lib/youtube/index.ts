import * as https from "https";
import { parse } from "url";
import { getapikey } from "../youtube-api-key";
import { ParsedUrlQueryInput, stringify } from "querystring";
import { Playlist, YoutubeVideo } from "../config";

interface YoutubeDataApiQuery extends ParsedUrlQueryInput {
  key: string;
  playlistId?: string;
  maxResults?: number;
  part?: string;
  pageToken?: string;
  id?: string | string[];
}

async function httpGet(url: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        resolve(data);
      });
      response.on("error", (error) => {
        console.log(error);
        reject(error);
      });
    });
  });
}

export function getID(youtubeURL: string): string {
  const queryParms = parse(youtubeURL, true);
  const id = queryParms.query.v;
  return id as string;
}

export async function getYoutubeTitleFromDataAPI(ID: string): Promise<string> {
  const query: YoutubeDataApiQuery = {
    key: getapikey(),
    part: "snippet",
    id: ID,
  };
  const response = await httpGet(
    `https://www.googleapis.com/youtube/v3/videos?${stringify(query)}`
  );
  return JSON.parse(response).items[0].snippet.title;
}

export async function getTitle(ID: string = ""): Promise<string> {
  if (ID === "" || ID.length != 11) {
    return "";
  }
  try {
    const title = await getYoutubeTitleFromDataAPI(ID);
    return title;
  } catch (err) {
    return "";
  }
}

function splitArray<T>(array: Array<T>, divLength: number): Array<Array<T>> {
  const splited: Array<Array<T>> = [];
  const divideCount = (array.length - (array.length % divLength)) / divLength;
  for (let i = 0; i < divideCount; i++) {
    splited.push(array.slice(i * divLength, i * divLength + divLength));
  }
  splited.push(
    array.slice(
      divideCount * divLength,
      divideCount * divLength + (array.length % divLength)
    )
  );
  return splited;
}

export async function getTitles(ids: string[]): Promise<string[]> {
  const splited = splitArray(ids, 50);
  // [ [id,id,id] [id,id,id] [id]] -> [[title,...] [title,...] [title]] -> [title...]
  const allTitles: Array<string> = (
    await Promise.all(
      splited.map(async (splitedIds): Promise<string[]> => {
        try {
          const query: YoutubeDataApiQuery = {
            key: getapikey(),
            part: "snippet",
            id: splitedIds,
          };
          const response = await httpGet(
            `https://www.googleapis.com/youtube/v3/videos?${stringify(query)}`
          );
          const titles = JSON.parse(response).items.map(
            (item: any) => item.snippet.title
          );
          return titles;
        } catch (err) {
          let nullTitles = [];
          for (let i = 0; i < splitedIds.length; i++) {
            nullTitles.push("");
          }
        }
      })
    )
  ).reduce((p, c) => p.concat(c), []);
  return allTitles;
}

export function getPlaylistID(url: string): string {
  return parse(url, true).query.list as string;
}

export async function getAllVideoFromYoutubePlaylistID(
  id: string
): Promise<YoutubeVideo[]> {
  if (id.length !== 34) {
    return [];
  }

  const query: YoutubeDataApiQuery = {
    key: getapikey(),
    playlistId: id,
    maxResults: 50,
    part: "snippet",
  };

  async function getVideos(
    videos: YoutubeVideo[] = [],
    nextPageToken: string = undefined
  ): Promise<YoutubeVideo[]> {
    if (nextPageToken !== undefined) {
      query.pageToken = nextPageToken;
    }
    const url =
      "https://www.googleapis.com/youtube/v3/playlistItems?" + stringify(query);
    const response: string = await httpGet(url);
    const jsonResult = JSON.parse(response);

    if (jsonResult.items) {
      JSON.parse(response).items.forEach((item) => {
        const title = item.snippet.title;
        if (title === "Deleted video") {
          return;
        }
        const id = item.snippet.resourceId.videoId;
        videos.push({
          id: id,
          title: title,
        } satisfies YoutubeVideo);
      });
    }
    if (jsonResult.nextPageToken !== undefined) {
      return getVideos(videos, jsonResult.nextPageToken);
    }

    return videos;
  }
  return await getVideos();
}

export function isPlaylistURL(url: string): boolean {
  const u = parse(url, true);
  return Boolean(u.query.list) && u.query.list.length === 34;
}
