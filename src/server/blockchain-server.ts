import fastify from 'fastify'

import { env } from '../env'
import { blockchainRoutes } from './routes/blockchain'

const app = fastify()

app.register(blockchainRoutes)

if (env.NODE_ENV !== 'test') {
  app
    .listen({
      port: env.PORT,
    })
    .then(() => {
      console.log(`HTTP Server Running at Port ${env.PORT}! 🚀`)
    })
}

export { app }
