// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// MegaETH testnet (chain 6343): 0xa84641aced4c404c58E8350AfD3F75bb183Bf77d

contract Faucet {
    error CantWithdrawYet();
    error NotOwner();
    error FaucetEmpty();

    uint public constant DRIP_AMOUNT = 0.001 ether;
    address public immutable owner;

    mapping(address => uint) public lastWithdrawalOfUser;

    constructor() {
        owner = msg.sender;
    }

    function getBalanceOfFaucet() public view returns (uint256) {
        return address(this).balance;
    }

    function requestFunds() external {
        if (block.timestamp < lastWithdrawalOfUser[msg.sender] + 24 hours) {
            revert CantWithdrawYet();
        }

        if (address(this).balance < DRIP_AMOUNT) {
            revert FaucetEmpty();
        }

        lastWithdrawalOfUser[msg.sender] = block.timestamp;

        (bool success, ) = payable(msg.sender).call{value: DRIP_AMOUNT}("");
        require(success, "Failed to send ETH");
    }

    function emergencyWithdraw() public {
        // in case i get botted. no ill intentions lol
        if (msg.sender != owner) {
            revert NotOwner();
        }
        (bool success, ) = payable(owner).call{value: address(this).balance}(
            ""
        );
        require(success, "Failed to send ETH");
    }
    receive() external payable {}
    fallback() external payable {}
}
