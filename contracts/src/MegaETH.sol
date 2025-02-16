// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MegaETH NFT Collection
/// @notice A soulbound NFT that can only be minted by the owner
contract MegaETH is ERC721, Ownable {
    uint256 public totalSupply;
    string public baseURI;

    error TokenIsSoulbound();

    event Minted(address indexed to, uint256 tokenId);

    constructor(address owner_) ERC721("MegaETH NFT", "MEGA") Ownable(owner_) {}

    /// @notice Mints a new NFT to the specified address
    /// @param to Address to receive the NFT
    function mint(address to) external onlyOwner returns (uint256) {
        require(to != address(0), "Invalid recipient");
        uint256 tokenId = totalSupply;
        _safeMint(to, tokenId);
        totalSupply++;
        emit Minted(to, tokenId);
        return tokenId;
    }

    /// @notice Sets the base URI for token metadata
    /// @param newBaseURI New base URI string
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }

    /// @notice Override of _update to implement soulbound mechanism
    /// @dev Prevents transfers after initial mint
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        // Allow minting, but prevent transfers
        if (from != address(0)) {
            revert TokenIsSoulbound();
        }
        return super._update(to, tokenId, auth);
    }

    /// @notice Override of base URI
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}
