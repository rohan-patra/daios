// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DaoToken.sol";
import "./MegaETH.sol"; // Ensure the file MegaETH.sol is in the same directory

/// @title DaoFactory
/// @notice Factory to create new DAO instances consisting of a soulbound NFT (MegaETH) and a DAO ERC20 token
contract DaoFactory {
    /// @notice DAO info structure
    struct Dao {
        address nft;
        address token;
        address owner;
        uint256 mintPrice;
        uint256 maxMintPerNFT;
        bool liquiditySeeded;
    }

    Dao[] public daos;

    event DaoCreated(
        address indexed owner,
        address nft,
        address token,
        uint256 mintPrice,
        uint256 maxMintPerNFT
    );

    event LiquiditySeeded(uint256 indexed daoIndex);

    /// @notice Creates a new DAO instance
    /// @param baseURI Base URI for the NFT metadata
    /// @param tokenName Name for the DAO ERC20 token
    /// @param tokenSymbol Symbol for the DAO ERC20 token
    /// @param tokenInitialSupply Initial supply (in wei) minted to the DAO creator
    /// @param mintPrice Price per token in wei
    /// @param maxMintPerNFT Maximum number of tokens that can be minted per NFT
    function createDao(
        string memory baseURI,
        string memory tokenName,
        string memory tokenSymbol,
        uint256 tokenInitialSupply,
        uint256 mintPrice,
        uint256 maxMintPerNFT
    ) external {
        // Deploy a new MegaETH soulbound NFT contract with msg.sender as payment receiver
        MegaETH nftContract = new MegaETH(msg.sender);
        nftContract.setBaseURI(baseURI);

        // Deploy a new ERC20 token contract for the DAO with NFT minting restrictions
        DaoToken tokenContract = new DaoToken(
            tokenName,
            tokenSymbol,
            msg.sender,
            address(nftContract),
            mintPrice,
            maxMintPerNFT
        );

        // Mint first NFT to creator
        nftContract.mint(msg.sender);

        daos.push(
            Dao({
                nft: address(nftContract),
                token: address(tokenContract),
                owner: msg.sender,
                mintPrice: mintPrice,
                maxMintPerNFT: maxMintPerNFT,
                liquiditySeeded: false
            })
        );

        emit DaoCreated(msg.sender, address(nftContract), address(tokenContract), mintPrice, maxMintPerNFT);
    }

    /// @notice Distributes liquidity and seeds Uniswap pool for a DAO
    /// @param daoIndex The index of the DAO to seed liquidity for
    function seedLiquidity(uint256 daoIndex) external {
        require(daoIndex < daos.length, "Invalid DAO index");
        Dao storage dao = daos[daoIndex];
        require(msg.sender == dao.owner, "Not DAO owner");
        require(!dao.liquiditySeeded, "Liquidity already seeded");

        DaoToken(dao.token).distributeLiquidityAndSeedPool();
        dao.liquiditySeeded = true;

        emit LiquiditySeeded(daoIndex);
    }

    /// @notice Returns the DAO at a given index
    /// @param index The index of the DAO
    function getDao(uint256 index) external view returns (Dao memory) {
        return daos[index];
    }

    /// @notice Returns the total number of DAOs created
    function totalDaos() external view returns (uint256) {
        return daos.length;
    }
}
