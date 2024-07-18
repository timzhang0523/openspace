import { http, createPublicClient, stringify,parseAbiItem } from 'viem'
import { mainnet } from 'viem/chains'
// import { WebSocketProvider } from 'viem/providers';

const client = createPublicClient({
  chain: mainnet,
  // transport: http()
  transport: http('https://rpc.flashbots.net'),

  // transport: http(`https://mainnet.infura.io/v3/3f381652632a4f70af6c9dcde5bf9d94`),

})

export async function usdcTransfer() {
  const currentBlock = await client.getBlockNumber();
  console.log("currentBlock=====>",currentBlock)

  const filter = await client.createEventFilter({
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',  // USDC contract address
    event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
    fromBlock: currentBlock - BigInt(10),
    toBlock: currentBlock
  });

  const logs = await client.getFilterLogs({ filter });
  // console.log(logs)
  return logs.map(log => {
      const { from, to, value } = log.args;
      const amount = Number(value) / 1e6;  
      console.log(from, to, amount);
      return { from, to, amount, transactionId: log.transactionHash };
  });
}

usdcTransfer().catch(console.error);

