// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";


contract NFTMarket {
    struct Listing {
        address seller;
        uint256 price;
    }

    IERC20 public token;
    IERC721 public nft;
    mapping(uint256 => Listing) public listings;
     mapping(address => uint256) public balances;

    event Listed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event DownListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event Purchased(uint256 indexed tokenId, address indexed buyer, uint256 price);

    constructor(address tokenAddress, address nftAddress) {
        token = IERC20(tokenAddress);
        nft = IERC721(nftAddress);
    }
    // 上架 nft
    function list(uint256 tokenId, uint256 price) public {
        require(nft.ownerOf(tokenId) == msg.sender, "Only the owner can list the NFT");
        require(price > 0, "Price must be greater than zero");

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price
        });

        nft.transferFrom(msg.sender, address(this), tokenId);

        emit Listed(tokenId, msg.sender, price);
    }
    // 下架
    function downlist(uint256 tokenId) public {
        
        Listing memory listing = listings[tokenId];

        require(listing.seller == msg.sender, "Only the owner can list the NFT");

        nft.transferFrom(address(this), msg.sender, tokenId);

        delete listings[tokenId];

        emit DownListed(tokenId, msg.sender, 0);
    }
    // 用户购买 回调
    // to 购买者地址 
    // amount 数量 2
    // data 交易ID：0x0000000000000000000000000000000000000000000000000000000000000002
    function tokensReceived(address to,uint amount,bytes calldata data) external returns (bool)  {
        require(msg.sender == address(token), "Only the token contract can call this function");

        // Decode the data to get the tokenId
        uint256 tokenId = abi.decode(data, (uint256));
        Listing memory listing = listings[tokenId];
        require(listing.price > 0, "This NFT is not for sale");
        require(amount >= listing.price, "Insufficient token amount sent");

        nft.transferFrom(address(this), to, tokenId);

        token.transfer(listing.seller,listing.price);

        delete listings[tokenId];

        emit Purchased(tokenId, msg.sender, listing.price);
        return true;

    }

    function getListing(uint256 tokenId) public view returns (address seller, uint256 price) {
        Listing memory listing = listings[tokenId];
        return (listing.seller, listing.price);
    }


}
