const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider('https://1rpc.io/sepolia');

// 合约地址
const contractAddress = '0x698038D3eb342cBd9877Cc7e60f21a669a6C76a3';

// 获取存储槽位置的哈希值
const getStorageSlot = (index) => {
    return ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['uint256'], [index]));
}

// 提取地址和时间
const extractUserAndStartTime = (hexData) => {
    const userHex = '0x' + hexData.slice(26, 66); // 提取地址（160位）
    const startTimeHex = '0x' + hexData.slice(10, 26); // 提取时间（64位）
    const user = ethers.utils.getAddress(userHex);
    const startTime = ethers.BigNumber.from(startTimeHex).toNumber();
    return { user, startTime };
}

// 获取单个锁的信息
const getLockInfo = async (baseSlot, index) => {

    const slot = ethers.BigNumber.from(baseSlot).add(index.mul(2));
    const userAndStartTimeSlot = slot.toHexString();;
    const amountSlot = slot.add(1).toHexString();
    const userAndStartTimeHex = await provider.getStorageAt(contractAddress, userAndStartTimeSlot);
    const amountHex = await provider.getStorageAt(contractAddress, amountSlot);

    const { user, startTime } = extractUserAndStartTime(userAndStartTimeHex);
    const amount = ethers.BigNumber.from(amountHex).toString();
    return { user, startTime:timestampToDate(startTime), amount };
}

const timestampToDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString(); // 乘以1000将秒转换为毫秒
}

// 获取所有锁的信息
const getLocks = async () => {
    const baseSlot = getStorageSlot(0);
    const locksLength = 11; 

    for (let i = 0; i < locksLength; i++) {
        const lockInfo = await getLockInfo(baseSlot, ethers.BigNumber.from(i));
        console.log(`locks[${i}]: user: ${lockInfo.user}, startTime: ${lockInfo.startTime}, amount: ${lockInfo.amount}`);
    }
}

getLocks().catch(console.error);
