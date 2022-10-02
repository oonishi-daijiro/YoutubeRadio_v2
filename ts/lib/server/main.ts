import { readFileSync } from "fs";
import http from "http";
import { AddressInfo } from "net";
import url from "url";
const playerIndex = readFileSync(__dirname + "../../../app/player/index.html")
const playerMainAppJs = readFileSync(__dirname + "../../../app/player/main.js")
const playerStylesheet = readFileSync(__dirname + "../../../app/player/style.css")


export function launchServer() {
  const server = http.createServer((req, res) => {
    const parm = url.parse(req.url as string, true)
    // res.setHeader("Access-Control-Allow-Origin", "*")
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
