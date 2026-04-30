const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RWAToken + Treasury Integration", function () {
  let token, treasury;
  let owner, user, other;

  const RATE = 100;

  beforeEach(async function () {
    [owner, user, other] = await ethers.getSigners();

    // Deploy Token
    const Token = await ethers.getContractFactory("RWAToken");
    token = await Token.deploy();
    await token.waitForDeployment();

    // Deploy Treasury
    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(await token.getAddress(), RATE);
    await treasury.waitForDeployment();

    // Link Treasury
    await token.setTreasury(await treasury.getAddress());
  });

  // =====================================================
  // DEPOSIT FLOW
  // =====================================================
  describe("Deposit Flow", function () {

    it("should mint correct tokens on deposit", async function () {
      const amount = ethers.parseEther("1");

      await treasury.connect(user).deposit({ value: amount });

      const balance = await token.balanceOf(user.address);

      expect(balance).to.equal(amount * BigInt(RATE));
    });

    it("should emit Deposited event", async function () {
      const amount = ethers.parseEther("1");

      await expect(
        treasury.connect(user).deposit({ value: amount })
      )
        .to.emit(treasury, "Deposited")
        .withArgs(user.address, amount, amount * BigInt(RATE));
    });

    it("should accumulate tokens on multiple deposits", async function () {
      const amount = ethers.parseEther("1");

      await treasury.connect(user).deposit({ value: amount });
      await treasury.connect(user).deposit({ value: amount });

      const balance = await token.balanceOf(user.address);

      expect(balance).to.equal(amount * BigInt(RATE) * 2n);
    });

    it("should update treasury ETH balance", async function () {
      const amount = ethers.parseEther("1");

      await treasury.connect(user).deposit({ value: amount });

      const balance = await ethers.provider.getBalance(
        await treasury.getAddress()
      );

      expect(balance).to.equal(amount);
    });
  });

  // =====================================================
  // WITHDRAWAL FLOW
  // =====================================================
  describe("Withdrawal Flow", function () {

    it("should allow owner to withdraw ETH", async function () {
      const amount = ethers.parseEther("1");

      await treasury.connect(user).deposit({ value: amount });

      const before = await ethers.provider.getBalance(owner.address);

      const tx = await treasury.withdraw(amount);
      const receipt = await tx.wait();

      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const after = await ethers.provider.getBalance(owner.address);

      expect(after).to.be.closeTo(
        before + amount - gasUsed,
        ethers.parseEther("0.001")
      );
    });

    it("should emit Withdrawn event", async function () {
      const amount = ethers.parseEther("1");

      await treasury.connect(user).deposit({ value: amount });

      await expect(treasury.withdraw(amount))
        .to.emit(treasury, "Withdrawn")
        .withArgs(owner.address, amount);
    });

    it("should allow withdrawing full balance", async function () {
      const amount = ethers.parseEther("1");

      await treasury.connect(user).deposit({ value: amount });

      await treasury.withdraw(amount);

      const balance = await ethers.provider.getBalance(
        await treasury.getAddress()
      );

      expect(balance).to.equal(0);
    });
  });

  // =====================================================
  // EDGE CASES & SECURITY
  // =====================================================
  describe("Edge Cases", function () {

    it("should revert on zero deposit", async function () {
      await expect(
        treasury.connect(user).deposit({ value: 0 })
      ).to.be.revertedWithCustomError(treasury, "InvalidAmount");
    });

    it("should prevent non-owner withdrawal", async function () {
      await expect(
        treasury.connect(user).withdraw(ethers.parseEther("1"))
      ).to.be.reverted;
    });

    it("should revert if withdrawing more than balance", async function () {
      await expect(
        treasury.withdraw(ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(treasury, "InsufficientBalance");
    });

    it("should revert mint if treasury not set", async function () {
      const Token = await ethers.getContractFactory("RWAToken");
      const newToken = await Token.deploy();
      await newToken.waitForDeployment();

      const Treasury = await ethers.getContractFactory("Treasury");
      const newTreasury = await Treasury.deploy(await newToken.getAddress(), RATE);
      await newTreasury.waitForDeployment();

      // Not linking treasury

      await expect(
        newTreasury.connect(user).deposit({
          value: ethers.parseEther("1"),
        })
      ).to.be.reverted;
    });

    it("should not allow treasury to be set twice", async function () {
      await expect(
        token.setTreasury(other.address)
      ).to.be.revertedWithCustomError(token, "TreasuryAlreadySet");
    });
  });

  // =====================================================
  // EXTRA SAFETY TESTS
  // =====================================================
  describe("Additional Safety", function () {

    it("should accept direct ETH transfers", async function () {
      const amount = ethers.parseEther("1");

      await user.sendTransaction({
        to: await treasury.getAddress(),
        value: amount,
      });

      const balance = await ethers.provider.getBalance(
        await treasury.getAddress()
      );

      expect(balance).to.equal(amount);
    });

    it("should update rate correctly", async function () {
      await treasury.setRate(200);

      const newRate = await treasury.rate();

      expect(newRate).to.equal(200);
    });

    it("should revert if rate is set to zero", async function () {
      await expect(
        treasury.setRate(0)
      ).to.be.revertedWithCustomError(treasury, "InvalidRate");
    });

    it("should use updated rate for minting", async function () {
      const amount = ethers.parseEther("1");

      await treasury.setRate(200);

      await treasury.connect(user).deposit({ value: amount });

      const balance = await token.balanceOf(user.address);

      expect(balance).to.equal(amount * 200n);
    });
  });
});