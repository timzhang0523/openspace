pragma solidity ^0.8.6;
// SPDX-License-Identifier: MIT

contract testCounter {
    uint counter;

    function add(uint index) public  {
        counter +=index;
    }

    function get() public view returns(uint256){
        return counter;
    }
   
}