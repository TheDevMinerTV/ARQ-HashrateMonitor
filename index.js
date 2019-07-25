const { RPCDaemon } = require('@arqma/arqma-rpc')
const ws281x = require('rpi-ws281x-native')

let pixelData = new Uint32Array(30)

let rpcDaemon = new RPCDaemon({
  url: 'http://192.168.43.140:59444'
})

ws281x.init(30)

function log(source, text) {
  console.log(`${new Date().toTimeString()} | ${source} | ${text}`)
}

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}

function getInfo() {
  return rpcDaemon.getInfo().then(info => {
    return {
      nethash: Math.round(info.difficulty / info.target),
      height: info.height,
      difficulty: info.difficulty
    }
  })
}

rpcDaemon.socketConnect()

process.on('SIGINT', function () {
  ws281x.reset();
  rpcDaemon.socketEnd()
  rpcDaemon.socketDestroy()

  process.nextTick(function () { process.exit(0); });
});

setInterval(async () => {
  const info = await getInfo()
  const nethash = info.nethash / 1000 / 1000
  log('Blockchain monitor', `${nethash} MH/s @ diff ${info.difficulty} on block ${info.height}`)

  for (let i = 0; i <= 30; i++) {
    pixelData[i] = rgb2Int(0, 0, 0)
  }
  for (let i = 0; i < Math.round(nethash / 10); i++) {
    pixelData[i] = rgb2Int(255, 255, 255)
  }

  ws281x.render(pixelData)
}, 5000)
