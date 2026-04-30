// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./RWAToken.sol";

contract Treasury is Ownable {
    RWAToken public immutable token;
    uint256 public rate;

    // -------- Errors --------
    error InvalidAmount();
    error InvalidAddress();
    error WithdrawFailed();
    error InsufficientBalance();
    error InvalidRate();

    // -------- Events --------
    event Deposited(
        address indexed user,
        uint256 ethAmount,
        uint256 tokensMinted
    );

    event Withdrawn(
        address indexed owner,
        uint256 amount
    );

    event RateUpdated(
        uint256 oldRate,
        uint256 newRate
    );

    constructor(address _token, uint256 _rate)
        Ownable(msg.sender)
    {
        if (_token == address(0)) revert InvalidAddress();
        if (_rate == 0) revert InvalidRate();

        token = RWAToken(_token);
        rate = _rate;
    }

    // -------- Deposit --------
    function deposit() external payable {
        uint256 amount = msg.value;
        if (amount == 0) revert InvalidAmount();

        uint256 tokens = amount * rate;

        token.mint(msg.sender, tokens);

        emit Deposited(msg.sender, amount, tokens);
    }

    // -------- Admin --------
    function setRate(uint256 _rate) external onlyOwner {
        if (_rate == 0) revert InvalidRate();

        uint256 oldRate = rate;
        rate = _rate;

        emit RateUpdated(oldRate, _rate);
    }

    function withdraw(uint256 amount) external onlyOwner {
        if (amount > address(this).balance) {
            revert InsufficientBalance();
        }

        (bool success, ) = payable(owner()).call{value: amount}("");
        if (!success) revert WithdrawFailed();

        emit Withdrawn(owner(), amount);
    }

    // -------- View --------
    function treasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}