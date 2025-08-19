// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint amount) external returns (bool);
}

contract TokenSpender {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // Example function to spend ERC20 tokens on behalf of a user
    function spendToken(address token, address from, uint amount) external {
        require(msg.sender == owner, "Only owner can call");
        IERC20(token).transferFrom(from, address(this), amount);
    }
}
