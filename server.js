const spawn = require('child_process').spawn
const mc = require('minecraft-protocol')
const jsyaml = require('js-yaml')
const fs = require('fs');

try {
  const config = jsyaml.load(fs.readFileSync('sleeping-server-config.yml', 'utf8'));
  const serverOpts = config.servers
  const bungee = config.bungee

  if(typeof(bungee) != "undefined") {
    const cmdArgs = `-Xmx${bungee.memory}M -Xms512M -jar ${bungee.binary}`.split(' ')
    const bungeeProc = spawn('java', cmdArgs, {
      cwd: bungee.directory,
      detached: true,
      stdio: 'ignore'
    })
  }

  for(var serverOpt in serverOpts){
    initServer(serverOpts[serverOpt])
  }
} catch (e) {
  console.log(e);
}

function initServer(serverOpt) {
  const options = {
    motd: 'sleeping server',
    maxPlayers: serverOpt.maxPlayers,
    port: serverOpt.port,
    'online-mode': serverOpt.online,
    beforeLogin: function(client) {
      client.end('Waking server up. Please try again in a few seconds.')
      server.close()
      console.log("closed sleeping server for", serverOpt.directory)
      const cmdArgs = `-Xmx${serverOpt.memory}M -Xms512M -jar ${serverOpt.binary} nogui`.split(' ')
      console.log(cmdArgs)
    
      console.log("Starting", serverOpt.directory)
      const mcProcess = spawn('java', cmdArgs, {
        cwd: serverOpt.directory,
        detached: serverOpt.detached,
        stdio: serverOpt.detached ? 'ignore' : 'inherit'
      }).on('error', function( err ){ 
        console.log(err)
        throw err
      })

      delete server

      mcProcess.on("close", (code) => {
        console.log("Closed with code", code)
      })

      mcProcess.on("error", (error) => {
        console.log("Error!", error)
      })

      mcProcess.on('exit', function (code, signal) {
        console.log('child process exited with ' +
                      `code ${code} and signal ${signal}`);
        initServer(serverOpt)
      })
    }
  }

  const server = mc.createServer(options)

  server.on('error', function (error) {
    console.log('Error:', error)
    server.close()
  })

  server.on('close', function() {
    delete server
    initServer(serverOpt)
  })
}
