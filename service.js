const logger = require('./lib/components/Logger');
require('dotenv').config()

logger.info('Initiating service...')

process.title = 'Solarbeam Faucet'

require('./lib/server.js')
