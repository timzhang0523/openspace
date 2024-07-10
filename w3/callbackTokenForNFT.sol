// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface OnERC721Received {
    function tokensReceived(address user,uint amount,bytes calldata data) external returns (bool); 
}

contract callbackDataToken is ERC20 {

    constructor(string memory name_, string memory symbol_, uint256 totalSupply_) ERC20(name_, symbol_) {
        _mint(msg.sender, totalSupply_);
    }

    function transferWithCallback(address recipient, uint256 amount,bytes calldata data) external returns (bool) {
        _transfer(msg.sender, recipient, amount);
        if (recipient.code.length >0) {
            bool rs = OnERC721Received(recipient).tokensReceived(msg.sender, amount,data);
            require(rs, "No tokensReceived");
        }
        return true;

    }
}