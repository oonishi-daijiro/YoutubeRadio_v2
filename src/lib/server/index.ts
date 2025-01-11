import { readFileSync } from "fs";
import * as http from "http";
import { type AddressInfo } from "net";
import * as path from "path";

export function launchServer(): number {
  const server = http.createServer((req, res) => {
    const playerIndex = readFileSync(
      path.resolve(__dirname, "./app/player/player.html")
    );
    const playerMainAppJs = readFileSync(
      path.resolve(__dirname, "./app/player/main.js")
    );
    const playerStylesheet = readFileSync(
      path.resolve(__dirname, "./app/player/style.css")
    );
    switch (req.url) {
      case "/":
        res.writeHead(200, {
          "Content-Type": "text/html",
        });
        res.write(playerIndex);
        break;
      case "/style.css":
        res.writeHead(200, {
          "Content-Type": "text/css",
        });
        res.write(playerStylesheet);
        break;
      case "/main.js":
        res.writeHead(200, {
          "Content-Type": "text/javascript",
        });
        res.write(playerMainAppJs);
        break;
      case "/export.js":
        res.writeHead(200, {
          "Content-Type": "text/javascript",
        });
        res.write("var exports={}");
        break;
      default:
        res.write("");
        break;
    }
    res.end();
  });
  server.listen(0);
  return (server.address() as AddressInfo).port;
}
