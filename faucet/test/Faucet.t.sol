// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {Faucet} from "../src/Faucet.sol";

contract FaucetTest is Test {
    Faucet public faucet;
    address public owner;
    address public alice;
    address public bob;
    uint256 public initialBalance;

    function setUp() public {
        owner = address(this);
        alice = address(0xA11CE);
        bob = address(0xB0B);
        
        vm.deal(owner, 10 ether);
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);
        
        faucet = new Faucet();
        
        initialBalance = 1 ether;
        (bool success, ) = address(faucet).call{value: initialBalance}("");
        require(success, "Failed to fund faucet");
        
        vm.warp(100000);
    }

    function test_InitialState() public view{
        assertEq(faucet.owner(), owner);
        assertEq(faucet.getBalanceOfFaucet(), initialBalance);
        assertEq(faucet.DRIP_AMOUNT(), 0.001 ether);
    }

    function test_RequestFunds() public {
        vm.startPrank(alice);
        
        uint256 aliceBalanceBefore = alice.balance;
        faucet.requestFunds();
        uint256 aliceBalanceAfter = alice.balance;
        
        assertEq(aliceBalanceAfter, aliceBalanceBefore + 0.001 ether);
        assertEq(faucet.getBalanceOfFaucet(), initialBalance - 0.001 ether);
        assertEq(faucet.lastWithdrawalOfUser(alice), block.timestamp);
        
        vm.stopPrank();
    }

    function test_RequestFunds_MultipleTimes() public {
        vm.startPrank(alice);
        
        faucet.requestFunds();
        
        vm.expectRevert(Faucet.CantWithdrawYet.selector);
        faucet.requestFunds();
        
        vm.warp(block.timestamp + 23 hours);
        vm.expectRevert(Faucet.CantWithdrawYet.selector);
        faucet.requestFunds();
        
        vm.warp(block.timestamp + 1 hours + 1 seconds);
        faucet.requestFunds();
        
        vm.stopPrank();
    }

    function test_MultiplePeople_RequestFunds() public {
        vm.startPrank(alice);
        faucet.requestFunds();
        vm.stopPrank();
        
        vm.startPrank(bob);
        faucet.requestFunds();
        vm.stopPrank();
        
        assertEq(faucet.getBalanceOfFaucet(), initialBalance - 0.002 ether);
    }

    function test_EmptyFaucet() public {
        Faucet emptyFaucet = new Faucet();
        
        vm.warp(100000);
        
        vm.startPrank(alice);
        vm.expectRevert(Faucet.FaucetEmpty.selector);
        emptyFaucet.requestFunds();
        vm.stopPrank();
    }

    function test_EmergencyWithdraw() public {
        vm.startPrank(alice);
        vm.expectRevert(Faucet.NotOwner.selector);
        faucet.emergencyWithdraw();
        vm.stopPrank();
        
        uint256 ownerBalanceBefore = owner.balance;
        faucet.emergencyWithdraw();
        uint256 ownerBalanceAfter = owner.balance;
        
        assertEq(ownerBalanceAfter, ownerBalanceBefore + initialBalance);
        assertEq(faucet.getBalanceOfFaucet(), 0);
    }

    function testFuzz_RequestFundsAtDifferentTimes(uint256 warpTime) public {
        vm.assume(warpTime > 0 && warpTime < 1000 days);
        
        vm.startPrank(alice);
        faucet.requestFunds();
        
        vm.warp(block.timestamp + warpTime);
        
        if (warpTime < 24 hours) {
            vm.expectRevert(Faucet.CantWithdrawYet.selector);
            faucet.requestFunds();
        } else {
            faucet.requestFunds();
            assertEq(faucet.lastWithdrawalOfUser(alice), block.timestamp);
        }
        
        vm.stopPrank();
    }

    receive() external payable {}
}