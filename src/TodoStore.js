import { v4 as uuid } from 'uuid'

export class TodoStore {
    constructor(store) {
        this.store = store ?? new Map()
    }

    todos(userId) {
        return this.store.get(userId)
    }

    updateTodoList(userId, newTodos) {
        this.store.set(userId, newTodos)
    }

    addTodo(todoContents, userId) {
        const todos = this.todos(userId)

        if (!todos) {
            return undefined
        }

        const todo = {
            body: todoContents.body,
            completed: todoContents.completed,
            id: uuid()
        }

        todos.push(todo)
        this.store.set(userId, todos)

        return todo
    }

    updateTodo(updatedTodo, userId) {
        const todos = this.todos(userId)

        if (!todos) {
            return undefined
        }

        const todoIdx = todos.findIndex( ({id}) => id == updatedTodo.id )

        if (todoIdx == -1) {
            return undefined
        }

        todos[todoIdx] = updatedTodo
        this.store.set(userId, todos)

        return updatedTodo
    }

    deleteTodo(todoId, userId) {
        const todos = this.todos(userId)

        if (!todos) {
            return undefined
        }

        const todoIdx = todos.findIndex( ({id}) => id == todoId )

        if (todoIdx == -1) {
            return undefined
        }

        const removedTodo = todos.splice(itemIdx, 1)
        this.store.set(userId, todos)

        return removedTodo
    }

    hasUser(userId) {
        return this.store.has(userId)
    }
}