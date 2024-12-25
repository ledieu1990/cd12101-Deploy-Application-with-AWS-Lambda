import { v4 as uuidv4 } from 'uuid'
import { TodoActions } from '../dataLayer/todoActions.mjs'

const todoActions = new TodoActions()

export async function getToDoList(userId) {
  return await todoActions.getToDoList(userId)
}

export async function createTodo(createTodoRequest, userId) {
  const todoId = uuidv4()
  const createdAt = new Date().toISOString()

  return await todoActions.createTodo({
    todoId: todoId,
    userId: userId,
    attachmentUrl: '',
    dueDate: createTodoRequest.dueDate,
    createdAt: createdAt,
    name: createTodoRequest.name,
    done: false
  })
}

export async function updateTodo(userId, todoId, updatedTodoRequest) {
  return await todoActions.updateTodo(userId, todoId, updatedTodoRequest)
}

export async function deleteTodo(userId, todoId) {
  return await todoActions.deleteTodo(userId, todoId)
}

export async function todoIdExists(userId, todoId) {
  return await todoActions.todoIdExists(userId, todoId)
}
