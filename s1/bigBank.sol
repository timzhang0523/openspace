// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract Bank {
    address public owner;
    mapping(address => uint256) public  balances;
    // mapping (address => bool) public depositors;
    address[] public top3;


    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }


    function updateTop3(address addr) internal {

        bool check_ = false;

        for (uint i = 0; i < top3.length; i++) {
            if (top3[i] == addr) {
                check_ = true;
                break;
            }
        }
        if (!check_) {
            if (top3.length < 3 )  {
                top3.push(addr);
                
            } else {
                for (uint i = 0; i < top3.length; i++) {
                    if (balances[addr] > balances[top3[i]] ) {
                        // 先插入一个新元素
                        top3.push(addr);
                        // depositors[addr] = true;
                    
                        // top3.push(addr);
                        // 指定位置后面的所有元素向后移动一位，再把新值指定位置元素。
                        for(uint j = top3.length - 1; j > i; j--) {
                            top3[j] = top3[j - 1];
                        }
                        top3[i] = addr;
                        // 删除数组最后一个元素
                        top3.pop();
                        break;
                    }
                }
            }
        }
        
        sortTop3();
    }

    function sortTop3() internal {
        for (uint i = 0; i < top3.length - 1; i++) {
            for (uint j = i + 1; j < top3.length; j++) {
                if (balances[top3[i]] < balances[top3[j]]) {
                    address temp = top3[i];
                    top3[i] = top3[j];
                    top3[j] = temp;
                }
            }
        }
    }

    function withdraw() external  {
        require(msg.sender == owner, "Only Ownable can withdraw");
        // require(address(this).balance >= amount, "Insufficient balance in the contract");
        payable(owner).transfer(address(this).balance);
    }

    function getTop3() public view returns (address[] memory) {
        return top3;
    }

    function getBalance(address addr) public view returns (uint) {
        return balances[addr];
    }
}



contract bigBank is Bank {
  
    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        deposit();
    }

    modifier checkEther {
        require(msg.value > 0.001 ether, "Deposit must be greater than 0.001 ether");
        _;
    }

    function transferOwner(address _newO) public onlyOwner {
        owner = _newO;
    }

    function deposit() public payable checkEther() {
        balances[msg.sender] += msg.value;
        updateTop3(msg.sender);
    }


}
