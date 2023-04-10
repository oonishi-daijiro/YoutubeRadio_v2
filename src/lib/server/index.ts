import { readFileSync } from "fs";
import * as http from "http";
import { AddressInfo } from "net";
import * as url from "url";
import * as path from "path";



const playerIndex = readFileSync(path.resolve(__dirname, './app/player/player.html'))
const playerMainAppJs = readFileSync(path.resolve(__dirname, './app/player/main.js'))
const playerStylesheet = readFileSync(path.resolve(__dirname, './app/player/style.css'))


export function launchServer() {
  const server = http.createServer((req, res) => {
    const parm = url.parse(req.url as string, true)
    if (parm.query.loaded === "true") {
      server.close()
    }
    const pathname = url.parse(req.url as string).pathname
    switch (pathname) {
      case "/":
        res.writeHead(200, {
          'Content-Type': 'text/html'
        })
        res.write(playerIndex)
        break;
      case "/style.css":
        res.writeHead(200, {
          'Content-Type': 'text/css'
        })
        res.write(playerStylesheet)
        break
      case "/main.js":
        res.writeHead(200, {
          'Content-Type': 'text/javascript'
        })
        res.write(playerMainAppJs)
        break;
      case "/export.js":
        res.writeHead(200, {
          'Content-Type': 'text/javascript'
        })
        res.write("var exports={}")
        break
      default:
        res.write("")
        break;
    }
    res.end()
  })
  server.listen(0)
  return (server.address() as AddressInfo).port
}
