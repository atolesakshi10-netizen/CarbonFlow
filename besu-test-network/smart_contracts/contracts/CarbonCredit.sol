
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonCredit is ERC20, Ownable {

    uint256 public totalIssued;
    uint256 public totalRetired;

    event CreditsIssued(
        address indexed recipient,
        uint256 amount
    );

    event CreditsRetired(
        address indexed account,
        uint256 amount
    );

    constructor()
        ERC20("Carbon Credit", "CC")
        Ownable(msg.sender)
    {}

    // Only owner can issue carbon credits
    function mint(
        address to,
        uint256 amount
    ) external onlyOwner {

        require(to != address(0), "Invalid address");
        require(amount > 0, "Amount must be positive");

        totalIssued += amount;

        _mint(to, amount);

        emit CreditsIssued(to, amount);
    }

    // Permanently retire carbon credits
    function retire(uint256 amount) external {

        require(amount > 0, "Amount must be positive");

        _burn(msg.sender, amount);

        totalRetired += amount;

        emit CreditsRetired(msg.sender, amount);
    }
}
