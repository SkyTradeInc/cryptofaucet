const axios = require('axios')
const logger = require('../components/Logger')

const successResponse = (response, message = null, data = null) => {
  response.status(200).send({
    success: true,
    timestamp: Date.now(),
    message,
    data
  })
}

const errorResponse = (response, message, status = 403) => {
  response.status(status).send({
    success: false,
    timestamp: Date.now(),
    message
  })
}

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(()=>{
      resolve(true)
    }, ms)
  })
}

module.exports = {
  successResponse,
  errorResponse,
  sleep,
}
