import axios from 'axios'

const BLOCKCHAIN_SERVER = 'http://localhost:3333'

async function mine(): Promise<void> {
  const { data } = await axios.get(`${BLOCKCHAIN_SERVER}/blocks/next`)
  const { block } = data

  console.log('Mining block', block)
}

mine()
