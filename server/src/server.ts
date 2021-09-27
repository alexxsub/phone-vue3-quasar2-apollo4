process.env['NODE_CONFIG_DIR'] = __dirname + '/configs'

import 'dotenv/config'
import App from 'app'
import IndexRoute from '@routes/index.route'
import validateEnv from '@utils/validateEnv'
import { logger, stream } from '@utils/logger'

validateEnv()

const app = new App([new IndexRoute()])

app.listen()
const cleanUp = (eventType:string) => {
    process.on('exit', (code) => {
      setTimeout(() => {
        logger.info(`Exited with code: ${code}`)
        app.disconnectDatabase()
      }, 0)
    })
    
  }
  [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType:string) => {
    process.on(eventType, cleanUp.bind(null, eventType))
  })
