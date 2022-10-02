import { safeStorage } from "electron";
import { readFileSync } from "fs";
import { resolve } from "path";

export function getapikey(): string {
  const apiFile = readFileSync(resolve("./enc_api_key"))
  try {
    return safeStorage.decryptString(apiFile)
  } catch (error) {
    console.log(error);
  }
}
