import express from 'express'
import bodyParser from 'body-parser'
import jwt from 'express-jwt'
import jwtAuthz from 'express-jwt-authz'
import jwksRsa from 'jwks-rsa'
import { v4 as uuid } from 'uuid'
import { TodoStore } from './TodoStore'

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
const checkJwt = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and 
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://auth-test-pro.auth0.com/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: 'https://todo.example.org',
  issuer: `https://auth-test-pro.auth0.com/`,
  algorithms: ['RS256']
})

const app = express()
app.use(bodyParser.json())
app.use(checkJwt)

const todoList = () => [
    {
        "body": "Return library book",
        "completed": false,
        "id": uuid()
    },
    {
        "body": "Water plants",
        "completed": false,
        "id": uuid()
    },
    {
        "body": "Shop for groceries",
        "completed": true,
        "id": uuid()
    },
    {
        "body": "Buy new cat toy",
        "completed": false,
        "id": uuid()
    }
]

const todoStore = new TodoStore()

app.get('/', function (req, res) {
    const userId = req.user.sub
    console.log(req.user)

    if (!todoStore.hasUser(userId)) {
        todoStore.updateTodoList(userId, todoList())
    }
    
    const todos = todoStore.todos(userId)
    console.log(todos)
    res.json(todos)
})

app.post('/', function (req, res) {
    console.log(req.body)
    const userId = req.user.sub
    const todo = req.body

    const newTodo = todoStore.addTodo(todo, userId)
    if (!newTodo) {
        res.status(404).end()
        return
    }
    res.json(newTodo)
})

app.patch('/:todoId', function (req, res) {
    const userId = req.user.sub
    const { todoId } = req.params
    const updatedTodo = {
        body: req.body.body,
        completed: req.body.completed,
        id: todoId
    }

    if (!todoStore.updateTodo(updatedTodo, userId)) {
        res.status(404).end()
        return
    }

    res.json(updatedTodo)
})

app.delete('/:todoId', function (req, res) {
    const userId = req.user.sub
    const { todoId } = req.params

    const removedTodo = todoStore.deleteTodo(todoId, userId)
    if (!removedTodo) {
        res.status(404).end()
        return
    }
    
    res.json(removedTodo)
})

app.listen(3000)