import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { updateTodo } from '../../businessLogic/todo.mjs'

const logger = createLogger('UpdateToDo')

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
    const todoId = event.pathParameters.todoId
    const updatedTodo = JSON.parse(event.body)
    const validtodoId = await todoIdExists(todoId, userId)

    if (!validtodoId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Todo item does not exist'
        })
      }
    }

    const updatedItem = await updateTodo(userId, todoId, updatedTodo)

    return {
      statusCode: 201,
      body: JSON.stringify({ updatedItem })
    }
  })

async function todoIdExists(todoId, userId) {
  const result = await dynamoDbClient.get({
    TableName: todosTable,
    Key: {
      userId: userId,
      todoId: todoId
    }
  })

  logger.info('Get Todo item: ', { result: result })
  return !!result.Item
}
