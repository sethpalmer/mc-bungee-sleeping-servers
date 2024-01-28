const spawn = require('child_process').spawn
const mc = require('minecraft-protocol')

function initServer(serverOpt) {
  const options = {
    motd: 'sleeping server',
    'max-players': 5,
    port: serverOpt.port,
    'online-mode': false,
    beforeLogin: function(client) {
      client.end('Waking server up. Please try again in a few seconds.')
      server.close()
      console.log("closed sleeping server for", serverOpt.directory)
      const cmdArgs = `-Xmx${serverOpt.memory}M -Xms${serverOpt.memory}M -jar ${serverOpt.binary} nogui`.split(' ')
      
      // var mcProcess = spawn('ls', {
      //   // To receive stop from kill on Windows
      //   stdio: ["overlapped", "inherit", "inherit"],
      //   cwd: serverOpt.directory,
      // })
    
      console.log("Starting", serverOpt.directory)
      const mcProcess = spawn('java', cmdArgs, {
        cwd: `D:\\Minecraft\\${serverOpt.directory}`
      })

      mcProcess.on("close", (code) => {
        console.log(code)
      })

      mcProcess.on("error", (error) => {
        console.log(error)
      })

      mcProcess.on("exit", (code) => {
        console.log("exited")
        console.log("starting up sleeping server")
        initServer(serverOpt)
      })
    }
  }

  const server = mc.createServer(options)

  server.on('error', function (error) {
    console.log('Error:', error)
  })

  server.on('listening', function () {
    console.log(serverOpt.directory, 'listening on port', server.socketServer.address().port)
  })
}

function wakeUpServer(serverOpt){
  const cmdArgs = `java -Xmx${serverOpt.memory}M -Xms${serverOpt.memory}M -jar ${serverOpt.binary} nogui`
  
  var mcProcess = spawn(cmdArgs, {
    // To receive stop from kill on Windows
    stdio: ["overlapped", "inherit", "inherit"],
    cwd: serverOpt.directory,
  })

  mcProcess.stdout.on('data', function(data) {
    console.log(serverOpt.directory, data.toString());
  });
}

const serverOpts = [
  {
    port: 25587,
    directory: 'hub-server',
    binary: 'paper-1.20.2-318.jar',
    memory: 512
  },
  {
    port: 25592,
    directory: 'survival-server',
    binary: 'paper-1.20.2-318.jar',
    memory: 4096
  },
  {
    port: 25593,
    directory: 'squirrel',
    binary: 'paper-1.20.2-318.jar',
    memory: 512
  },
  {
    port: 25595,
    directory: 'breezecraft',
    binary: 'paper-1.20.2-318.jar',
    memory: 512
  },
  {
    port: 25596,
    directory: 'seth-mimi-luke-clarissa',
    binary: 'paper-1.20.2-318.jar',
    memory: 512
  },
  {
    port: 25597,
    directory: 'cedar-server',
    binary: 'paper-1.20.2-318.jar',
    memory: 512
  },
  {
    port: 25598,
    directory: 'creative-server',
    binary: 'paper-1.20.2-318.jar',
    memory: 512
  }
]

for(var serverOpt in serverOpts){
  initServer(serverOpts[serverOpt])
}

const cmdArgs = `-Xmx512M -Xms512M -jar BungeeCord.jar nogui`.split(' ')
const bungeeProc = spawn('java', cmdArgs, {
  cwd: `D:\\Minecraft\\bungeecord-server`
})
bungeeProc.stdout.on('data', function(data) {
  console.log(data.toString());
});