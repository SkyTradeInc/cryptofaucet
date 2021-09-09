const express = require('express');
const redis = require('redis');
const axios = require('axios');

const router = express.Router();

const logger = require('../../components/Logger')
const web3 = require('../../components/Web3')

const {
  successResponse,
  errorResponse,
} = require('../../helpers')

const client = redis.createClient(process.env.REDIS_URL);

let redisConnected = false;
let inOrder = false;

client.on('connect', () => {
  redisConnected = true
  console.log(`[+] Connected to Redis`);
});
client.on('error', err => {
    console.log(`[!] Error connecting to Redis: ${err}`);
});

router.get('/ping', (request, response) => {
  return successResponse(response, 'pong')
})

router.get('/balance/:address', (request, response) => {
  const { address } = request.params
  if (!web3.utils.isAddress(address)) return errorResponse(response, 'Invalid address')
  web3.eth.getBalance(address)
  .then(balance => {
    return successResponse(response, null, balance)
  })
  .catch(error => {
    return errorResponse(response, error)
  })
})

router.get('/tx/:txHash', (request, response) => {
  const { txHash } = request.params
  web3.eth.getTransaction(txHash)
  .then(tx => {
    return successResponse(response, null, tx)
  })
  .catch(error => {
    return errorResponse(response, error)
  })
})

router.get('/q', (request, response) => {
  return successResponse(response, 'pong', parseFloat(process.env.REQUEST_LIMIT))
})

router.post('/request', verifyRecaptcha, checkInOrder, async (request, response) => {
  try {
    inOrder = true;
    const { address, amount } = request.body;
    const receipt = await web3.request(request.body.address, request.body.amount)
    inOrder = false;
    return response.send({
        success: true,
        message: `You have successfuly been sent ${amount} MOVR`,
        receipt,
        amount
    })
  } catch (error) {
    inOrder = false;
    return errorResponse(response, error)
  }
})

function checkInOrder(request, response, next) {
  if(inOrder) return errorResponse(response, 'Processing too many orders, please try again in a moment');
  next()
}

function verifyRecaptcha(request, response, next) {
    const key = request.body["g-recaptcha-response"]
    axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_CAPTCHA_SECRET}&response=${request.body["g-recaptcha-response"]}`)
      .then(response => {
        if(response.data.success) {
          next()
        } else {
          return errorResponse(response, 'Invalid reCaptcha')
        }
      })
      .catch(error => {
        return errorResponse(response, 'Invalid reCaptcha')
      })
}

function secondsToString(uptime) {
    if(uptime > 86400) {
      uptime = uptime/86400;
      return (uptime.toFixed(3) + " days");
    } else if (uptime > 3600) {
      uptime = uptime/3600;
      return (uptime.toFixed(2) + " hours")
    } else if (uptime > 60) {
      uptime = uptime/60;
      return (uptime.toFixed(2) + " minutes")
    } else {
      return(uptime.toFixed(0) + " seconds")
    }
  }

function timeLeft(timestamp) {
    const timeNeeded = process.env.REDIS_EXPIRE_SECONDS*1000
    const timePassed = (Date.now() - timestamp)
    const timeLeft = timeNeeded - timePassed
    return secondsToString(timeLeft/1000)
}

function checkRedisStatus(request, response, next) {
    if(redisConnected) {
        return next()
    } else {
        return response.send({
            success: false,
            message: "Server Error: Cannot establish a connection with the database"
        })
    }
}

function checkLimit(request, response, next) {
    const { amount, address } = request.body
    client.get(address.toLowerCase(), function(error, result) {
        if (error) {
            console.log(error);
            throw error;
        } else {
            if(!result) return next()
            result = JSON.parse(result)
            if(result.address == address.toLowerCase()) {
                if(result.amount == process.env.REQUEST_LIMIT) {
                    return response.send({
                        success: false,
                        message: `You have reached the daily limit. <br> <b>Requests:</b> ${result.amount}/${praseFloat(process.env.REQUEST_LIMIT)} <br><b>Limit expires</b> in ${timeLeft(result.timestamp)}`
                    })
                }
                if(result.amount+amount > parseFloat(process.env.REQUEST_LIMIT)) {
                   return response.send({
                        success: false,
                        message: `Requesting ${amount} more will put you over the limit. <br> <b>Requests:</b> ${result.amount}/${praseFloat(process.env.REQUEST_LIMIT)} <br><b>Limit expires</b> in ${timeLeft(result.timestamp)}`
                    })
                } else {
                    if(result.amount>0) request.amount = result.amount
                    next()
                }
            }
        }
    })
}



module.exports = router;
