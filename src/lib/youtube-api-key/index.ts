
// import { writeFileSync, readFileSync } from "fs";
// import { resolve } from "path";
// import { safeStorage } from "electron";

export function getapikey(): string {
  // Safestorage is not returns same value on different computer.
  return "AIzaSyDIjQyl6lVNjnfUvYMSp9J7PZXjdxs0Qtg";

  // const apiFile = readFileSync(resolve(__dirname, "./apikey.enc"))
  // try {
  //   return safeStorage.decryptString(apiFile)
  // } catch (error) {
  //   console.log(error);
  // }
}
