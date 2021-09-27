process.env['NODE_CONFIG_DIR'] = __dirname + '/configs'


import config from 'config'
import path from 'path'
import express from 'express'
// middlewares modules
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import hpp from 'hpp'
//import morgan from 'morgan'

import { errorLog, successLog } from '@/middlewares/morgan.middleware'
import { connect,disconnect,set } from 'mongoose'
import { dbConnection } from '@/databases'
import { Routes } from '@interfaces/routes.interface'
import errorMiddleware from '@middlewares/error.middleware'
import { logger, stream } from '@utils/logger'


class App {
  public app: express.Application
  public port: string | number
  public env: string

  constructor(routes: Routes[]) {
    this.app = express()
    this.port = process.env.PORT || 3000
    this.env = process.env.NODE_ENV || 'development'
    this.connectToDatabase()
    this.initializeMiddlewares()
    this.initializeRoutes(routes)
    this.initializeErrorHandling()
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`========> ENV: ${this.env} <=======`)
      logger.info(`🚀 Expreess server started on port: ${this.port}`)
    })
  }

  public getServer() {
    return this.app
  }

  private connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true);
    }
    connect(dbConnection.url, dbConnection.options)
    .then(() => logger.info(`🎉 Mongo connected ${dbConnection.url}`))
    .catch((err) => console.error(err))
    .then(()=>disconnect())
 
  }

  public disconnectDatabase(){
    disconnect()
  }

  private initializeMiddlewares() {
    

    /*
    // variant 1 
      this.app.use(morgan(config.get('log.format')))//HTTP request logger
    // variant 2
      this.app.use(morgan(function (tokens, req, res) { // custom HTTP request logger
      return [
        tokens.date(req, res, 'clf'),
        tokens['remote-addr'](req, res),
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
      ].join(' ')
    }))*/
    
    this.app.use(cors({ origin: config.get('cors.origin'), credentials: config.get('cors.credentials') }))//for Cross-origin resource sharing
    this.app.use(hpp()) // to protect against HTTP Parameter Pollution attacks
    this.app.use(helmet())// helps you secure your Express apps by setting various HTTP headers
    this.app.use(compression()) // to compress
    this.app.use(express.json())// for parsing application/json
    this.app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
    this.app.use(cookieParser())//Parse Cookie header and populate req.cookies with an object keyed by the cookie names
    this.app.use(express.static(path.join(__dirname, 'public')))
    this.app.use(successLog) // morgan success logger
    this.app.use(errorLog) // morgan error logger
  }
  
  //routes
  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router)
    });
  }

 //error handlers
  private initializeErrorHandling() {
    this.app.use(errorMiddleware)
  }
}




export default App
