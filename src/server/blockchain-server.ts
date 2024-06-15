import fastify from 'fastify'

import { env } from '../env'
import { blockchainRoutes } from './routes/blockchain'

const app = fastify()

app.register(blockchainRoutes)

app
  .listen({
    port: env.BLOCKCHAIN_SERVER_PORT,
  })
  .then(() => {
    console.log(
      `HTTP Server Running at BLOCKCHAIN_SERVER_PORT ${env.BLOCKCHAIN_SERVER_PORT}! 🚀`,
    )
  })

export { app }
