const spawn = require('child_process').spawn
const mc = require('minecraft-protocol')
const jsyaml = require('js-yaml')
const fs = require('fs');

try {
  const config = jsyaml.load(fs.readFileSync('sleeping-server-config.yml', 'utf8'));
  const serverOpts = config.servers
  const bungee = config.bungee
  const cmdArgs = `-Xmx${bungee.memory}M -Xms${bungee.memory}M -jar ${bungee.binary} nogui`.split(' ')
  const bungeeProc = spawn('java', cmdArgs, {
    cwd: bungee.directory
  })
  bungeeProc.stdout.on('data', function(data) {
    console.log(data.toString());
  });

  for(var serverOpt in serverOpts){
    initServer(serverOpts[serverOpt])
  }
} catch (e) {
  console.log(e);
}

function initServer(serverOpt) {
  const options = {
    motd: 'sleeping server',
    maxPlayers: 5,
    port: serverOpt.port,
    'online-mode': false,
    beforeLogin: function(client) {
      client.end('Waking server up. Please try again in a few seconds.')
      server.close()
      console.log("closed sleeping server for", serverOpt.directory)
      const cmdArgs = `-Xmx${serverOpt.memory}M -Xms${serverOpt.memory}M -jar ${serverOpt.binary} nogui`.split(' ')
    
      console.log("Starting", serverOpt.directory)
      const mcProcess = spawn('java', cmdArgs, {
        cwd: serverOpt.directory
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
