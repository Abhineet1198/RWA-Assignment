// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./RWAToken.sol";

contract Treasury is Ownable, ReentrancyGuard {
    RWAToken public immutable token;

    uint256 public rate;
    uint256 public constant MIN_DEPOSIT = 0.01 ether;

    bool public paused;

    // -------- Errors --------
    error InvalidAmount();
    error InvalidAddress();
    error WithdrawFailed();
    error InsufficientBalance();
    error InvalidRate();
    error Paused();

    // -------- Events --------
    event Deposited(address indexed user, uint256 ethAmount, uint256 tokensMinted);
    event Withdrawn(address indexed owner, uint256 amount);
    event RateUpdated(uint256 oldRate, uint256 newRate);
    event PausedStateChanged(bool status);
    event Received(address indexed sender, uint256 amount);

    constructor(address _token, uint256 _rate) Ownable(msg.sender) {
        if (_token == address(0)) revert InvalidAddress();
        if (_rate == 0) revert InvalidRate();

        token = RWAToken(_token);
        rate = _rate;
    }

    // -------- Modifiers --------
    modifier notPaused() {
        if (paused) revert Paused();
        _;
    }

    // -------- Deposit --------
    function deposit() external payable notPaused nonReentrant {
        uint256 amount = msg.value;

        if (amount < MIN_DEPOSIT) revert InvalidAmount();

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

    function setPaused(bool _status) external onlyOwner {
        paused = _status;
        emit PausedStateChanged(_status);
    }

    function withdraw(uint256 amount) external onlyOwner nonReentrant {
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

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}