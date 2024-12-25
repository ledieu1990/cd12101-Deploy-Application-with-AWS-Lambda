import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'

export class TodoActions {
  constructor(
    dynamoDb = AWSXRay.captureAWSv3Client(new DynamoDB()),
    todosTable = process.env.TODOS_TABLE
  ) {
    this.dynamoDb = dynamoDb
    this.todosTable = todosTable
    this.dynamoDbClient = DynamoDBDocument.from(this.dynamoDb)
  }

  async getToDoList(userId) {
    console.log('Getting all TODO items')
    const result = await this.dynamoDbClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    })

    return result.Items
  }

  async createTodo(newItem) {
    console.log(`Creating a TODO item with id ${newItem.todoId}`)
    await this.dynamoDbClient.put({
      TableName: this.todosTable,
      Item: newItem
    })

    return newItem
  }

  async updateTodo(userId, todoId, updatedTodo) {
    console.log(`Updating a TODO item with id ${todoId}`)
    await this.dynamoDbClient.update({
      TableName: this.todosTable,
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

    return ''
  }

  async deleteTodo(userId, todoId) {
    console.log(`Deleting a TODO item with id ${todoId}`)
    await this.dynamoDbClient.delete({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    })

    return ''
  }

  async todoIdExists(todoId, userId) {
    const result = await this.dynamoDbClient.get({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    })

    return !!result.Item
  }
}
