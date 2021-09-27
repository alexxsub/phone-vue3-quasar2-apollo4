import { Request, Response } from 'express'
import httpStatus from 'http-status'
import asyncHandler from '@utils/asyncHandler'

class IndexController {
  public index = asyncHandler((req: Request, res: Response) => {

       res.status(httpStatus.OK).send('Express works!')
  
})
}

export default IndexController
