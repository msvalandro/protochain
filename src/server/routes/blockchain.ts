import { FastifyInstance } from 'fastify'
import { z, ZodError } from 'zod'

import { Block } from '../../lib/block'
import { Blockchain } from '../../lib/blockchain'
import { Transaction } from '../../lib/transaction'
import { TransactionType } from '../../lib/transaction-type'
import { ValidationError } from '../../lib/validation-error'

export async function blockchainRoutes(app: FastifyInstance): Promise<void> {
  const blockchain = new Blockchain()

  app.get('/status', () => {
    return {
      mempool: blockchain.getMempool().length,
      blocks: blockchain.getBlocks().length,
      isValid: blockchain.isValid(),
      lastBlock: blockchain.getLastBlock(),
    }
  })

  app.get('/blocks/next', () => {
    const nextBlock = blockchain.getNextBlock()

    return { block: nextBlock }
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
      transactions: z.array(
        z.object({
          type: z.enum([TransactionType.FEE, TransactionType.REGULAR]),
          to: z.string(),
          txInput: z.optional(
            z.object({
              fromAddress: z.string(),
              amount: z.number(),
              signature: z.string(),
            }),
          ),
          timestamp: z.number(),
          hash: z.string(),
        }),
      ),
      nonce: z.number(),
      miner: z.string(),
      timestamp: z.number(),
      hash: z.string(),
    })

    try {
      const {
        index,
        transactions,
        previousHash,
        nonce,
        miner,
        timestamp,
        hash,
      } = createBlockBodySchema.parse(request.body)

      const block = new Block({
        index,
        transactions,
        previousHash,
        nonce,
        miner,
        timestamp,
        hash,
      })

      blockchain.addBlock(block)

      return reply.status(201).send({ block })
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

  app.get('/transactions/:hash?', (request, reply) => {
    const getTransactionParamsSchema = z.object({
      hash: z.optional(z.string()),
    })
    const { hash } = getTransactionParamsSchema.parse(request.params)

    if (hash) {
      const findTransaction = blockchain.getTransaction(hash)

      if (!findTransaction) {
        return reply.status(404).send()
      }

      return { transaction: blockchain.getTransaction(hash) }
    }

    return {
      next: blockchain.getMempool().slice(0, Blockchain.TX_PER_BLOCK),
      total: blockchain.getMempool().length,
    }
  })

  app.post('/transactions', (request, reply) => {
    const createTransactionBodySchema = z.object({
      // type: z.enum([TransactionType.FEE, TransactionType.REGULAR]),
      to: z.string(),
      txInput: z.optional(
        z.object({
          fromAddress: z.string(),
          amount: z.number(),
          signature: z.string(),
        }),
      ),
      // timestamp: z.number(),
      // hash: z.string(),
    })

    try {
      const { to, txInput } = createTransactionBodySchema.parse(request.body)
      const transaction = new Transaction({ to, txInput })

      blockchain.addTransaction(transaction)

      return reply.status(201).send({ transaction })
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          message: 'Could not create the transaction with the provided data',
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
