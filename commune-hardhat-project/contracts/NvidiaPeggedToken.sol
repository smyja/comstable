// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NvidiaPeggedToken is ERC20, Ownable {
    uint256 public lastPrice;
    uint256 public lastUpdateTime;
    
    event PriceUpdated(uint256 newPrice, uint256 timestamp);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    function updatePrice(uint256 newPrice) external onlyOwner {
        lastPrice = newPrice;
        lastUpdateTime = block.timestamp;
        
        emit PriceUpdated(newPrice, block.timestamp);
    }

    function getPrice() public view returns (uint256) {
        return lastPrice;
    }
}