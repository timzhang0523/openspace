// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract tokenBank {
    using SafeERC20 for IERC20;
    IERC20 public  token;
    address owner;
    mapping(address => uint256) public balances;
    event Deposit(address indexed user, uint256 amount);
    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }
    receive() external payable {
    }

    constructor() {
        owner = msg.sender;
    }
    
    function setToken(IERC20 _token) public  onlyOwner  {
        token = _token;
    }

    function tokensReceived(address to,uint amount) external returns (bool)  {
        require(msg.sender == address(token), "Only the token contract can call this function");
        balances[to] += amount;
        emit Deposit(to, amount);
        return true;
    }

    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance in the contract");
        bytes memory payload = abi.encodeWithSignature("transfer(address,uint256)", msg.sender,amount);
        (bool success, ) = address(token).call(payload);
        if(success){
            balances[msg.sender] -= amount;
        }
    }
}
