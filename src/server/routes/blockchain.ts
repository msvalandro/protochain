import { FastifyInstance } from 'fastify'
import { z, ZodError } from 'zod'

import { Block } from '../../lib/block'
import { Blockchain } from '../../lib/blockchain'
import { ValidationError } from '../../lib/validation-error'

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
    const getBlockParamsSchema = z.object({ indexOrHash: z.string() })
    const { indexOrHash } = getBlockParamsSchema.parse(request.params)

    const block = /^[0-9]+$/.test(indexOrHash)
      ? blockchain.getBlocks()[parseInt(indexOrHash)]
      : blockchain.getBlock(indexOrHash)

    if (!block) {
      return reply.status(404).send()
    }

    return { block }
  })

  app.post('/blocks', (request, reply) => {
    const createBlockBodySchema = z.object({
      index: z.number(),
      previousHash: z.string(),
      data: z.string(),
    })

    try {
      const { index, data, previousHash } = createBlockBodySchema.parse(
        request.body,
      )
      const block = new Block({ index, data, previousHash })
      blockchain.addBlock(block)

      return reply.status(201).send(block)
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          message: 'Could not create the block with the provided data',
          errors: error.errors,
        })
      }

      if (error instanceof ValidationError) {
        return reply.status(400).send({ message: error.message })
      }

      return reply.status(500).send()
    }
  })
}