import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import AWSXRay from 'aws-xray-sdk-core'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('GenerateUploadUrl')

const dynamoDb = AWSXRay.captureAWSv3Client(new DynamoDB())
const dynamoDbClient = DynamoDBDocument.from(dynamoDb)
const s3Client = new S3Client()

const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

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

    const url = await getUploadUrl(todoId)

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers':
          'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
      },
      body: JSON.stringify({
        uploadUrl: url
      })
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

async function getUploadUrl(id) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: id
  })
  const url = await getSignedUrl(s3Client, command, {
    expiresIn: urlExpiration
  })
  return url
}
