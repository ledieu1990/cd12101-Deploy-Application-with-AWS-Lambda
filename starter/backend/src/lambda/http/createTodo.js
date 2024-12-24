import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import AWSXRay from 'aws-xray-sdk-core'
import { v4 as uuidv4 } from 'uuid'
import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('CreateToDo')

const dynamoDb = AWSXRay.captureAWSv3Client(new DynamoDB())
const dynamoDbClient = DynamoDBDocument.from(dynamoDb)

const todosTable = process.env.TODOS_TABLE

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('Processing event: ', { event: event })
    const todoId = uuidv4()
    const createdAt = new Date().toISOString()
    const userId = getUserId(event)
    const newTodo = JSON.parse(event.body)
    const newItem = {
      todoId: todoId,
      userId: userId,
      attachmentUrl: '',
      dueDate: newTodo.dueDate,
      createdAt: createdAt,
      name: newTodo.name,
      done: false
    }

    await dynamoDbClient.put({
      TableName: todosTable,
      Item: newItem
    })

    return {
      statusCode: 201,
      body: JSON.stringify({
        newItem
      })
    }
  })
