import { Request, Response } from 'express'
import morgan from 'morgan'
import {logger} from '../utils/logger'

morgan.token('message', (req: Request, res: Response): string => (res.locals.errorMessage as string) || '')

const getIpFormat = () => (process.env.NODE_ENV === 'production' ? ':remote-addr - ' : '')
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`

export const successLog = morgan(successResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode >= 400,
  stream: { write: (message: string) => logger.info(message.trim()) },
})

export const errorLog = morgan(errorResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode < 400,
  stream: { write: (message: string) => logger.error(message.trim()) },
})