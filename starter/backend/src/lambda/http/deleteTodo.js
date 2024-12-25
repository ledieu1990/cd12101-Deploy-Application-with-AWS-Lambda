import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { deleteTodo, todoIdExists } from '../../businessLogic/todo.mjs'

const logger = createLogger('DeleteToDo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('Processing event: ', { event: event })
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const validtodoId = await todoIdExists(todoId, userId)

    if (!validtodoId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Todo item does not exist'
        })
      }
    }

    const deletedItem = await deleteTodo(userId, todoId)

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers':
          'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
      },
      body: JSON.stringify({ deletedItem })
    }
  })
