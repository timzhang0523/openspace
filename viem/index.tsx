import React, { useState } from 'react'
import { http, createPublicClient,type Address,createWalletClient,custom, parseEther } from 'viem'
import { mainnet } from 'viem/chains'
import { wagmiContract } from './contract'
import ReactDOM from 'react-dom/client'
import 'viem/window'

const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
})

console.log("========",walletClient )

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const ownaddress = '0x4434cdB635790aCAF993B1308cD18EF510Bb8f4A'
const tokenId = 200

// types of batched reads instead.
// const 
const [name, totalSupply, symbol, tokenUri, balance,ownerOf] = await Promise.all([
  client.readContract({
    ...wagmiContract,
    functionName: 'name',
  }),
  client.readContract({
    ...wagmiContract,
    functionName: 'totalSupply',
  }),
  client.readContract({
    ...wagmiContract,
    functionName: 'symbol',
  }),
  client.readContract({
    ...wagmiContract,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
  }),
  client.readContract({
    ...wagmiContract,
    functionName: 'balanceOf',
    args: [ownaddress],
  }),

  client.readContract({
    ...wagmiContract,
    functionName: 'ownerOf',
    args: [BigInt(tokenId)],
  }),

])

export default [
  `Deploy Address: ${ownaddress}`,
  `Contract Address: ${wagmiContract.address}`,
  `Name: ${name}`,
  `Total Supply: ${totalSupply}`,
  `Symbol: ${symbol}`,
  `Token URI of #200: ${tokenUri}`,
  `Balance of ${ownaddress}: ${balance}`,
  `OwnerOf of ${tokenId}: ${ownerOf}`,
]
function Example() {
  const [account, setAccount] = useState<Address>()
  const connect = async () => {
    const [address] = await walletClient.requestAddresses()
    console.log("====11111====",address )
    setAccount(address)
  }

  const sendTransaction = async () => {
    if (!account) return
    
  }

  if (account)

    


    return (
      <>
        <div>Connected: {account}</div>
        <button onClick={sendTransaction}>GET NFT INFOs</button>
      </>
    )
  return <button onClick={connect}>Connect Wallet</button>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Example />,
)