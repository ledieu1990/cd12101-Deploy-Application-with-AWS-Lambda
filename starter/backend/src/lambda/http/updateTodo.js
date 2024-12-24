import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB())

const todosTable = process.env.TODOS_TABLE

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    console.log('Processing event: ', event)
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

    await dynamoDbClient.update({
      TableName: todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression:
        'SET #name = :newName, #dueDate = :newDueDate, #done = :newStatus',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
      ExpressionAttributeValues: {
        ':newName': updatedTodo.name,
        ':newDueDate': updatedTodo.dueDate,
        ':newStatus': updatedTodo.done
      }
    })

    return {
      statusCode: 201,
      body: JSON.stringify({})
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

  console.log('Get Todo item: ', result)
  return !!result.Item
}
