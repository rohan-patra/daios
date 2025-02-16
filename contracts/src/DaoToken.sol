// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IUniswapV2Router02 {
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

/// @title DaoToken
/// @notice An ERC20 token that can be minted by NFT holders with limits
contract DaoToken is ERC20, Ownable, Pausable {
    IERC721 public nft;
    uint256 public mintPrice;
    uint256 public maxMintPerNFT;
    mapping(uint256 => uint256) public nftMinted;
    
    uint256 public accumulatedFees;
    bool public liquiditySeeded;
    
    IUniswapV2Router02 public constant UNISWAP_ROUTER = IUniswapV2Router02(0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008); // Sepolia Router
    IUniswapV2Factory public constant UNISWAP_FACTORY = IUniswapV2Factory(0x7E0987E5b3a30e3f2828572Bb659A548460a3003); // Sepolia Factory

    event MintPriceUpdated(uint256 newPrice);
    event MaxMintPerNFTUpdated(uint256 newLimit);
    event TokensMinted(address indexed minter, uint256 indexed tokenId, uint256 amount);
    event LiquiditySeeded(uint256 tokensUsed, uint256 ethUsed);
    event FeesDistributed(uint256 creatorAmount, uint256 liquidityAmount);

    constructor(
        string memory name,
        string memory symbol,
        address owner_,
        address nftAddress,
        uint256 _mintPrice,
        uint256 _maxMintPerNFT
    ) ERC20(name, symbol) Ownable(owner_) {
        require(nftAddress != address(0), "Invalid NFT address");
        nft = IERC721(nftAddress);
        mintPrice = _mintPrice;
        maxMintPerNFT = _maxMintPerNFT;
    }

    /// @notice Allows NFT holders to mint tokens
    /// @param tokenId The NFT token ID to use for minting
    /// @param amount Amount of tokens to mint
    function mint(uint256 tokenId, uint256 amount) external payable whenNotPaused {
        require(nft.ownerOf(tokenId) == msg.sender, "Not NFT owner");
        require(msg.value == amount * mintPrice, "Incorrect payment");
        require(nftMinted[tokenId] + amount <= maxMintPerNFT, "Exceeds mint limit");

        nftMinted[tokenId] += amount;
        _mint(msg.sender, amount);
        accumulatedFees += msg.value;
        
        emit TokensMinted(msg.sender, tokenId, amount);
    }

    /// @notice Distributes accumulated fees and seeds Uniswap liquidity pool
    function distributeLiquidityAndSeedPool() external onlyOwner {
        require(accumulatedFees > 0, "No fees to distribute");
        require(!liquiditySeeded, "Liquidity already seeded");
        
        uint256 totalFees = accumulatedFees;
        accumulatedFees = 0;
        
        // Calculate 90% for creator and 10% for liquidity
        uint256 creatorAmount = (totalFees * 90) / 100;
        uint256 liquidityAmount = totalFees - creatorAmount;
        
        // Send 90% to creator
        (bool success, ) = owner().call{value: creatorAmount}("");
        require(success, "Creator transfer failed");
        
        // Calculate token amount for liquidity (same value as ETH at mint price)
        uint256 tokenAmount = (liquidityAmount * 1e18) / mintPrice;
        _mint(address(this), tokenAmount);
        
        // Approve router to spend tokens
        _approve(address(this), address(UNISWAP_ROUTER), tokenAmount);
        
        // Add liquidity to Uniswap
        (uint256 tokensSent, uint256 ethSent,) = UNISWAP_ROUTER.addLiquidityETH{value: liquidityAmount}(
            address(this),
            tokenAmount,
            0, // Accept any amount of tokens
            0, // Accept any amount of ETH
            owner(), // Send LP tokens to owner
            block.timestamp + 300 // 5 minute deadline
        );
        
        liquiditySeeded = true;
        _pause(); // Pause minting after seeding liquidity
        
        emit LiquiditySeeded(tokensSent, ethSent);
        emit FeesDistributed(creatorAmount, liquidityAmount);
    }

    /// @notice Updates the mint price (only owner)
    /// @param newPrice New price per token
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }

    /// @notice Updates the maximum mint limit per NFT (only owner)
    /// @param newLimit New maximum mint limit per NFT
    function setMaxMintPerNFT(uint256 newLimit) external onlyOwner {
        maxMintPerNFT = newLimit;
        emit MaxMintPerNFTUpdated(newLimit);
    }

    /// @notice Pauses token minting
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpauses token minting
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Withdraws collected fees to the owner
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Transfer failed");
    }

    /// @notice View function to check remaining mint allowance for an NFT
    /// @param tokenId The NFT token ID to check
    /// @return remaining The remaining amount of tokens that can be minted with this NFT
    function remainingMintAllowance(uint256 tokenId) external view returns (uint256) {
        return maxMintPerNFT - nftMinted[tokenId];
    }
}
