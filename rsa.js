const crypto = require('crypto');

// 生成公私钥对
function generateKeyPair() {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
}

// 计算SHA256哈希值
function calculateHash(nickname, nonce) {
  return crypto.createHash('sha256').update(nickname + nonce).digest('hex');
}

// POW 算法
function proofOfWork(nickname, leadingZeros) {
  let nonce = 0;
  let hash = '';
  const target = '0'.repeat(leadingZeros);
  const startTime = Date.now();

  while (!hash.startsWith(target)) {
    nonce++;
    hash = calculateHash(nickname, nonce);
  }

  const endTime = Date.now();
  const timeTaken = (endTime - startTime) / 1000; // 计算花费的时间（秒）

  return { timeTaken, nonce, hash };
}

// 签名
function signData(privateKey, data) {
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  return sign.sign(privateKey, 'hex');
}

// 验证签名
function verifySignature(publicKey, data, signature) {
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  verify.end();
  return verify.verify(publicKey, signature, 'hex');
}

// 主程序
const nickname = '大锤'; 

// 生成公私钥对
const { publicKey, privateKey } = generateKeyPair();

// POW计算，满足4个前导零
const result4 = proofOfWork(nickname, 4);
const dataToSign = nickname + result4.nonce;

// 用私钥签名
const signature = signData(privateKey, dataToSign);

// 用公钥验证签名
const isVerified = verifySignature(publicKey, dataToSign, signature);

// 打印结果
console.log(`4 Leading Zeros - Time: ${result4.timeTaken}s, Nonce: ${result4.nonce}, Hash: ${result4.hash}`);
console.log(`Data to Sign: ${dataToSign}`);
console.log(`publicKey: ${publicKey}`);
console.log(`Signature: ${signature}`);
console.log(`Signature Verified: ${isVerified}`);
