// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RWAToken is ERC20, Ownable {
    address public treasury;

    uint256 public constant MAX_SUPPLY = 1_000_000 ether;

    // -------- Errors --------
    error NotTreasury(address caller);
    error ZeroAddress();
    error TreasuryAlreadySet();
    error MaxSupplyExceeded();

    // -------- Events --------
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event TokensMinted(address indexed to, uint256 amount);

    constructor() ERC20("RWA Token", "RWA") Ownable(msg.sender) {}

    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        if (treasury != address(0)) revert TreasuryAlreadySet();

        treasury = _treasury;
        emit TreasuryUpdated(address(0), _treasury);
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != treasury) revert NotTreasury(msg.sender);

        if (totalSupply() + amount > MAX_SUPPLY) {
            revert MaxSupplyExceeded();
        }

        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
}