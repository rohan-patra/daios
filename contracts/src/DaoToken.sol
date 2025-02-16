// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title DaoToken
/// @notice An ERC20 token that can be minted by NFT holders with limits
contract DaoToken is ERC20, Ownable, Pausable {
    IERC721 public nft;
    uint256 public mintPrice;
    uint256 public maxMintPerNFT;
    mapping(uint256 => uint256) public nftMinted;

    event MintPriceUpdated(uint256 newPrice);
    event MaxMintPerNFTUpdated(uint256 newLimit);
    event TokensMinted(address indexed minter, uint256 indexed tokenId, uint256 amount);

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
        
        emit TokensMinted(msg.sender, tokenId, amount);
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
