import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createPublicClient, http, parseAbiItem, formatUnits } from 'viem';
import { mainnet } from 'viem/chains';

// USDT 合约地址
const USDT_CONTRACT_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7';

// Transfer 事件的 ABI 格式
const TRANSFER_EVENT_ABI = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');

const App = () => {
    const [blockHeight, setBlockHeight] = useState<number | null>(null);
    const [blockHash, setBlockHash] = useState<string | null>(null);
    const [transfers, setTransfers] = useState<any[]>([]);

    useEffect(() => {
        const client = createPublicClient({
            chain: mainnet,
            transport: http('https://rpc.particle.network/evm-chain?chainId=1&projectUuid=1cd17d2b-ee24-4aa3-9fb5-3faa106ae467&projectKey=cYpcUN7ybk6OXeDpCX0hMTt9aZAs7woMDHFP9KF5'),
        });

        const fetchBlockData = async () => {
            const latestBlock = await client.getBlock({ blockTag: 'latest' });
            setBlockHeight(Number(latestBlock.number));
            setBlockHash(latestBlock.hash);
        };

        const subscribeToEvents = () => {
            client.watchBlockNumber({
                onBlockNumber: async (blockNumber) => {
                    if (blockNumber === undefined) {
                        setBlockHeight(null);
                        return;
                    }

                    const safeBlockNumber = blockNumber !== undefined ? BigInt(blockNumber) : 0n; // 提供默认值
                    console.log(safeBlockNumber, "Safe Block Number");
                    setBlockHeight(Number(safeBlockNumber));
                    
                    const fromBlock = safeBlockNumber - 100n;
                    const toBlock = safeBlockNumber;

                    const logs = await client.getLogs({
                        address: USDT_CONTRACT_ADDRESS,
                        event: TRANSFER_EVENT_ABI,
                        fromBlock,
                        toBlock,
                    });

                    console.log(logs, "Logs");

                    const newTransfers = logs.map(log => {
                        const { from, to, value } = log.args || {};
                        console.log(log, "Log");
                        return {
                            blockNumber: log.blockNumber.toString(), // 转换为字符串
                            transactionHash: log.transactionHash,
                            from,
                            to,
                            value: value ? Number(formatUnits(value, 6)).toFixed(5) : '0.00000' // 处理 value 可能为 undefined 的情况
                        };
                    });
                    console.log(newTransfers, "New Transfers");
                    setTransfers(newTransfers);
                },
            });
        };

        fetchBlockData();
        subscribeToEvents();
    }, []);

    return (
        <div>
            <h1>最新区块信息</h1>
            <p>区块高度: {blockHeight}</p>
            <p>区块哈希值: {blockHash}</p>
            <h2>最新 USDT 转账记录</h2>
            {transfers.map((transfer, index) => (
                <div key={index}>
                    <p>在 {transfer.blockNumber} 区块 {transfer.transactionHash} 交易中从 {transfer.from} 转账 {transfer.value} USDT 到 {transfer.to}</p>
                </div>
            ))}
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));

