import * as https from "https";
import { getapikey } from "../youtube-api-key";
import { type ParsedUrlQueryInput, stringify } from "querystring";
import { type YoutubeVideo } from "../config";

interface YoutubeDataApiQuery extends ParsedUrlQueryInput {
  key: string;
  playlistId?: string;
  maxResults?: number;
  part?: string;
  pageToken?: string;
  id?: string | string[];
}

async function httpGet(url: string): Promise<string> {
  console.log("api used");
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
  const queryParms = new URL(youtubeURL);
  const id = queryParms.searchParams.get("v");
  return id ?? "";
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
  if (ID === "" || ID.length !== 11) {
    return "";
  }
  try {
    const title = await getYoutubeTitleFromDataAPI(ID);
    return title;
  } catch (err) {
    return "";
  }
}

function splitArray<T>(array: T[], divLength: number): T[][] {
  const splited: T[][] = [];
  const divideCount = (array.length - (array.length % divLength)) / divLength;
  for (let i = 0; i < divideCount; i++) {
    splited.push(array.slice(i * divLength, i * divLength + divLength));
  }
  if (array.length > 0) {
    splited.push(
      array.slice(
        divideCount * divLength,
        divideCount * divLength + (array.length % divLength)
      )
    );
  }
  return splited;
}

export async function getTitles(ids: string[]): Promise<string[]> {
  const splited = splitArray(ids, 50);
  console.log(splited);
  // [ [id,id,id] [id,id,id] [id]] -> [[title,...] [title,...] [title]] -> [title...]
  const allTitles: string[] = (
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
          const nullTitles = [];
          for (let i = 0; i < splitedIds.length; i++) {
            nullTitles.push("");
          }
        }
        return [];
      })
    )
  ).reduce((p, c) => p.concat(c), []);
  return allTitles;
}

export function getPlaylistID(url: string): string {
  const ul = new URL(url);
  return ul.searchParams.get("list") ?? "";
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
    nextPageToken: string | undefined = undefined
  ): Promise<YoutubeVideo[]> {
    if (nextPageToken !== undefined) {
      query.pageToken = nextPageToken;
    }
    const url =
      "https://www.googleapis.com/youtube/v3/playlistItems?" + stringify(query);
    const response: string = await httpGet(url);
    const jsonResult = JSON.parse(response);

    if (jsonResult.items !== undefined) {
      JSON.parse(response).items.forEach(
        (item: {
          snippet: { title: string; resourceId: { videoId: string } };
        }) => {
          const title = item.snippet.title;
          if (title === "Deleted video") {
            return;
          }
          const id = item.snippet.resourceId.videoId;
          videos.push({
            id,
            title,
          } satisfies YoutubeVideo);
        }
      );
    }
    if (jsonResult.nextPageToken !== undefined) {
      return await getVideos(
        videos,
        jsonResult.nextPageToken as string | undefined
      );
    }

    return videos;
  }
  return await getVideos();
}

export function isPlaylistURL(url: string): boolean {
  const u = new URL(url);
  const isIncludesList = u.searchParams.get("list") !== null;
  const isParmLengthValid = u.searchParams.get("list")?.length === 34;

  return isIncludesList && isParmLengthValid;
}
