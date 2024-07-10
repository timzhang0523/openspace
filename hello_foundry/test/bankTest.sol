// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test,Vm,console2} from "forge-std/Test.sol";
import {Bank} from "../src/bank.sol";

contract bankTest is Test {
    Bank public bank;


    function setUp() public {
        vm.label(msg.sender, "MSG_SENDER");
    }

    function testDepositETH() public {
        bank = new Bank();
        uint256 _amount = 10000000;

        // vm.expectEmit();
        // 记录所有事件
        vm.recordLogs();

        // Deposit
        vm.deal(msg.sender, _amount);
        vm.startPrank(msg.sender);

        (bool _success, ) = address(bank).call{value: _amount}(
            abi.encodeWithSignature("depositETH()")
        );
        
        uint balance = address(bank).balance;
        console2.log("balance:%s==========",balance);
        // 断言检查存款前后用户在 Bank 合约中的存款额更新是否正确。
        assertEq(balance, _amount,"emitted ether mismatch.");

        vm.stopPrank();

        assertTrue(_success, "deposited ETH payment success.");

        Vm.Log[] memory entries = vm.getRecordedLogs();

        bytes32 deposited_event_signature = keccak256(
            "Deposit(address,uint256)"
        );
        // console2.log("=======0======",msg.sender);
        
        for (uint256 i; i < entries.length; i++) {
            if (entries[i].topics[0] == deposited_event_signature) {
                assertEq(
                    address(uint160(uint256((entries[i].topics[1])))),
                    msg.sender,
                    "emitted sender mismatch."
                );

                assertEq(
                    abi.decode(entries[i].data, (uint256)),
                    _amount,
                    "emitted amount mismatch."
                );

                assertEq(
                    entries[i].emitter,
                    address(bank),
                    "emitter contract mismatch."
                );

                break;
            }


        }

    }

}
