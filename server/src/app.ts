process.env['NODE_CONFIG_DIR'] = __dirname + '/configs'

import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import config from 'config'
import express from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import morgan from 'morgan'
import { connect,set } from 'mongoose'

import { dbConnection } from 'databases'
import { Routes } from '@interfaces/routes.interface'
import errorMiddleware from '@middlewares/error.middleware'
import { logger, stream } from '@utils/logger'

class App {
  public app: express.Application
  public port: string | number
  public env: string

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = process.env.PORT || 3000
    this.env = process.env.NODE_ENV || 'development'
    this.connectToDatabase()
    this.initializeMiddlewares()
    this.initializeRoutes(routes)
    this.initializeErrorHandling()
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`======= ENV: ${this.env} =======`)
      logger.info(`🚀 Expreess server started on port: ${this.port}`)
    });
  }

  public getServer() {
    return this.app;
  }

  private connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true);
    }

    connect(dbConnection.url, dbConnection.options)
  }

  private initializeMiddlewares() {
    this.app.use(morgan(config.get('log.format'), { stream }))
    this.app.use(cors({ origin: config.get('cors.origin'), credentials: config.get('cors.credentials') }))
    this.app.use(hpp())
    this.app.use(helmet())
    this.app.use(compression())
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(cookieParser())
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router)
    });
  }


  private initializeErrorHandling() {
    this.app.use(errorMiddleware)
  }
}

export default App
