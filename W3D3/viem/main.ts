import { createClient, createEventFilter } from 'viem';
import { mainnet } from 'viem/chains';
import { WebSocketProvider } from 'viem/providers';
import { ethers } from 'ethers';

// 设置 WebSocket 提供者
const wsProvider = new WebSocketProvider('wss://mainnet.infura.io/ws/v3/e2420cf7b2a24931866c223cd9d00c7f');

// 创建 Viem 客户端
const client = createClient({
  chain: mainnet,
  provider: wsProvider,
});

// USDC 合约地址
const USDC_CONTRACT_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9EB0cE3606eB48';
// Transfer 事件签名
const TRANSFER_EVENT_SIG = ethers.utils.id('Transfer(address,address,uint256)');

// 用于存储转账记录
let transferLogs = [];

// 处理转账日志
async function handleTransferLog(log) {
  const { topics, data } = log;
  const from = ethers.utils.getAddress('0x' + topics[1].slice(26));
  const to = ethers.utils.getAddress('0x' + topics[2].slice(26));
  const value = ethers.BigNumber.from(data).toString();

  transferLogs.push({ from, to, value });

  if (transferLogs.length > 100) {
    transferLogs.shift(); // 保持最近的 100 条记录
  }

  console.log('Recent USDC Transfers:', transferLogs);
}

// 启动监听
async function startListening() {
  const filter = createEventFilter({
    address: USDC_CONTRACT_ADDRESS,
    topics: [TRANSFER_EVENT_SIG],
  });

  wsProvider.on(filter, (log) => {
    handleTransferLog(log);
  });

  const latestBlock = await client.getBlockNumber();
  const logs = await client.getLogs({
    address: USDC_CONTRACT_ADDRESS,
    topics: [TRANSFER_EVENT_SIG],
    fromBlock: latestBlock - 100,
    toBlock: latestBlock,
  });

  
  logs.forEach(handleTransferLog);
}

startListening().catch((error) => {
  console.error('Error starting listener:', error);
});
