const ensureUser = require('../../middleware/validators').ensureUser
const user = require('./controller')

// export const baseUrl = '/users'
module.exports.baseUrl = '/api/users'

module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [
      user.createUser
    ]
  },
  {
    method: 'GET',
    route: '/',
    handlers: [
      ensureUser,
      user.getUsers
    ]
  },
  {
    method: 'GET',
    route: '/:id',
    handlers: [
      ensureUser,
      user.getUser
    ]
  },
  {
    method: 'PUT',
    route: '/:id',
    handlers: [
      ensureUser,
      user.getUser,
      user.updateUser
    ]
  },
  {
    method: 'DELETE',
    route: '/:id',
    handlers: [
      ensureUser,
      user.getUser,
      user.deleteUser
    ]
  }
]
