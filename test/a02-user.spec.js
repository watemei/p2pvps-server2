/*
  TODO:
*/

const should = require('chai').should
const cleanDb = require('./utils').cleanDb
const serverUtil = require('../bin/util')
const rp = require('request-promise')
const assert = require('chai').assert
const utils = require('./utils')

const LOCALHOST = 'http://localhost:5000'

should()
// const request = supertest.agent(app.listen())
const context = {}

describe('Users', () => {
  before(async () => {
    // await app.startServer()

    cleanDb()

    // Create a second test user.
    const userObj = {
      username: 'test2',
      password: 'pass2'
    }
    const testUser = await utils.createUser(userObj)

    context.user2 = testUser.user
    context.token2 = testUser.token
  })

  after(async () => {
    // Restore the admin user.
    await serverUtil.createSystemUser()
  })

  describe('POST /users', () => {
    it('should reject signup when data is incomplete', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/api/users`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            username: 'supercoolname'
          }
        }

        let result = await rp(options)

          // console.log(`result: ${JSON.stringify(result, null, 2)}`)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 422) {
          assert(err.statusCode === 422, 'Error code 422 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should sign up', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/api/users`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            user: {
              username: 'test',
              password: 'pass'
            }
          }
        }

        let result = await rp(options)

        // console.log(`result: ${JSON.stringify(result, null, 2)}`)

        context.user = result.body.user
        context.token = result.body.token

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert(result.body.user.username === 'test', 'Username of test expected')
        assert(result.body.user.password === undefined, 'Password expected to be omited')
        assert.property(result.body, 'token', 'Token property exists.')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })
  })

  describe('GET /users', () => {
    it('should not fetch users if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/users`,
          resolveWithFullResponse: true,
          json: true
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 422) {
          assert(err.statusCode === 422, 'Error code 422 expected.')
        } else if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should not fetch users if the authorization header is missing the scheme', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/users`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: '1'
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 422) {
          assert(err.statusCode === 422, 'Error code 422 expected.')
        } else if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should not fetch users if the authorization header has invalid scheme', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/users`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Unknown ${context.token}`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 422) {
          assert(err.statusCode === 422, 'Error code 422 expected.')
        } else if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should not fetch users if token is invalid', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/users`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Bearer: '1'
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 422) {
          assert(err.statusCode === 422, 'Error code 422 expected.')
        } else if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should fetch all users', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/users`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          }
        }

        let result = await rp(options)

        // console.log(`Users: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert.isArray(result.body.users, 'returns an array of users.')
        assert.notProperty(result.body.users[0], 'password', 'Password not included.')
        assert.notProperty(result.body.users[0], 'dashIds', 'dashIds not included.')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })
  })

  describe('GET /users/:id', () => {
    it('should not fetch user if token is invalid', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/users/1`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer 1`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        // if (err.statusCode === 422) {
        //  assert(err.statusCode === 422, 'Error code 422 expected.')
        // } else
        if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should throw 404 if user doesn\'t exist', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/users/1`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 404) {
          assert(err.statusCode === 404, 'Error code 404 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should fetch user', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/users/${context.user._id.toString()}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          }
        }

        let result = await rp(options)

        // console.log(`Users: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert(result.body.user.username === 'test', 'Username of test expected')
        assert.notProperty(result.body.user, 'password', 'Password not included.')
        assert.property(result.body.user, 'dashIds', 'dashIds property included.')
        assert.isArray(result.body.user.dashIds, 'dashIds is an array')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })

    it('should not include dashIds when user 2 queries user 1', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/users/${context.user._id.toString()}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token2}`
          }
        }

        let result = await rp(options)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert(result.body.user.username === 'test', 'Username of test expected')
        assert.notProperty(result.body.user, 'password', 'Password not included.')
        assert.notProperty(result.body.user, 'dashIds', 'dashIds property included.')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })
  })

  describe('PUT /api/users/:id', () => {
    it('should not update user if token is invalid', async () => {
      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/users/${context.user._id.toString()}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer 1`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should throw 404 if user doesn\'t exist', async () => {
      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/users/1`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should update user', async () => {
      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/users/${context.user._id.toString()}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          },
          body: {
            user: {
              username: 'updatedcoolname'
            }
          }
        }

        let result = await rp(options)

        // console.log(`Users: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert(result.body.user.username === 'updatedcoolname', 'Username of test expected')
        assert(result.body.user.password === undefined, 'Password expected to be omited')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })

    it('should not be able to update user type', async () => {
      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/users/${context.user._id.toString()}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          },
          body: {
            user: {
              name: 'new name',
              type: 'test'
            }
          }
        }

        let result = await rp(options)

        // console.log(`Users: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert(result.body.user.type === 'user', 'Type should be unchanged.')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })

    it('should not be able to update other user', async () => {
      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/users/${context.user2._id.toString()}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          },
          body: {
            user: {
              name: 'This should not work'
            }
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })
  })

  describe('DELETE /users/:id', () => {
    it('should not delete user if token is invalid', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/users/${context.user._id.toString()}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer 1`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should throw 404 if user doesn\'t exist', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/users/1`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should not be able to delete other users unless admin', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/users/${context.user2._id.toString()}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should delete user', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/users/${context.user._id.toString()}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          },
          body: {
            user: {
              username: 'updatedcoolname'
            }
          }
        }

        let result = await rp(options)

        // console.log(`Users: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })
  })
})
