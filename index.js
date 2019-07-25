const { RPCDaemon } = require('@arqma/arqma-rpc')
// const ws281x = require('rpi-ws281x-native')

// let pixelData = new Uint32Array(27)

let rpcDaemon = new RPCDaemon({
  url: 'http://127.0.0.1:59444'
})

// ws281x.init(27)

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
  // ws281x.reset();
  rpcDaemon.socketEnd()
  rpcDaemon.socketDestroy()

  process.nextTick(function () { process.exit(0); });
});

setInterval(async () => {
  const info = await getInfo()
  log('Blockchain monitor', `${info.nethash / 1000 / 1000} MH/s @ diff ${info.difficulty} on block ${info.height}`)
}, 5000)