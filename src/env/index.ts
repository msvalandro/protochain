import 'dotenv/config'

import { z } from 'zod'

const envSchema = z.object({
  BLOCKCHAIN_SERVER_URL: z.string().default('http://localhost:3333'),
  BLOCKCHAIN_SERVER_PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  WALLET_PRIVATE_KEY: z.string(),
  BLOCKCHAIN_OWNER_WALLET: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('💥 Invalid environment variables!', _env.error.format())
  throw new Error('Invalid environment variables.')
}

export const env = _env.data
