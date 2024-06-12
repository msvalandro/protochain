import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { Blockchain } from '../../lib/blockchain'

export async function blockchainRoutes(app: FastifyInstance): Promise<void> {
  const blockchain = new Blockchain()

  app.get('/status', () => {
    return {
      numberOfBlocks: blockchain.getBlocks().length,
      isValid: blockchain.isValid(),
      lastBlock: blockchain.getLastBlock(),
    }
  })

  app.get('/blocks/:indexOrHash', (request, reply) => {
    const getBlockParamsSchema = z.object({
      indexOrHash: z.string(),
    })
    const { indexOrHash } = getBlockParamsSchema.parse(request.params)

    const block = /^[0-9]+$/.test(indexOrHash)
      ? blockchain.getBlocks()[parseInt(indexOrHash)]
      : blockchain.getBlock(indexOrHash)

    if (!block) {
      return reply.status(404).send()
    }

    return { block }
  })
}
