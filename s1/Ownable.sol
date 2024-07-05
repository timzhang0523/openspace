pragma solidity >=0.8.0;
// SPDX-License-Identifier: MIT


interface Ibank {
    function withdraw() external; 
}

contract Ownable {

    address public owner;
    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }
    receive() external payable {
    }

    constructor() {
        owner = msg.sender;
    }


    function withdraw(Ibank bank) public onlyOwner {
        bank.withdraw();
    }


}