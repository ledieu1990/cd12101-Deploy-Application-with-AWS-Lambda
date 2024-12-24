import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { getToDoList } from '../../businessLogic/todo.mjs'

const logger = createLogger('GetToDoList')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('Processing event: ', { event: event })
    const userId = getUserId(event)
    const todos = await getToDoList(userId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        items: todos
      })
    }
  })
