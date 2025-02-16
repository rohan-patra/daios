// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/DaoFactory.sol";
import "../src/DaoToken.sol";
import "../src/MegaETH.sol";

contract DaoFactoryTest is Test {
    DaoFactory factory;
    address daoOwner = address(0xABCD);

    function setUp() public {
        // Deploy the factory contract
        factory = new DaoFactory();
    }

    function testCreateDao() public {
        // Use vm.prank to simulate a call from daoOwner
        vm.prank(daoOwner);
        string memory baseURI = "https://example.com/metadata/";
        string memory tokenName = "DAO Governance";
        string memory tokenSymbol = "DAO";
        uint256 initialSupply = 1000 * 1e18;
        uint256 mintPrice = 0.1 ether;
        uint256 maxMintPerNFT = 1000 * 1e18;

        // Create a new DAO
        factory.createDao(baseURI, tokenName, tokenSymbol, initialSupply, mintPrice, maxMintPerNFT);

        // Retrieve DAO information from the factory
        DaoFactory.Dao memory dao = factory.getDao(0);

        // Check that the NFT contract has the correct base URI
        MegaETH nft = MegaETH(dao.nft);
        assertEq(nft.baseURI(), baseURI);

        // Check that the DAO token minted the correct initial supply to daoOwner
        DaoToken token = DaoToken(dao.token);
        uint256 balance = token.balanceOf(daoOwner);
        assertEq(balance, initialSupply);

        // Check that the token contract has correct mint price and limit
        assertEq(token.mintPrice(), mintPrice);
        assertEq(token.maxMintPerNFT(), maxMintPerNFT);
        assertEq(address(token.nft()), dao.nft);
    }

    function testTotalDaos() public {
        vm.prank(daoOwner);
        factory.createDao(
            "uri1",
            "Token1",
            "TKN1",
            1000 * 1e18,
            0.1 ether,
            1000 * 1e18
        );
        vm.prank(daoOwner);
        factory.createDao(
            "uri2",
            "Token2",
            "TKN2",
            2000 * 1e18,
            0.2 ether,
            2000 * 1e18
        );
        assertEq(factory.totalDaos(), 2);
    }

    function testTokenMinting() public {
        // Create a DAO
        vm.prank(daoOwner);
        factory.createDao(
            "uri1",
            "Token1",
            "TKN1",
            1000 * 1e18,
            0.1 ether,
            1000 * 1e18
        );

        DaoFactory.Dao memory dao = factory.getDao(0);
        DaoToken token = DaoToken(dao.token);
        MegaETH nft = MegaETH(dao.nft);

        // Test minting with NFT
        address user1 = address(0x1234);
        vm.prank(daoOwner);
        nft.mint(user1);

        vm.deal(user1, 1 ether); // Give user1 some ETH
        vm.prank(user1);
        token.mint{value: 0.1 ether}(0, 1 * 1e18); // Mint using NFT ID 0

        assertEq(token.balanceOf(user1), 1 * 1e18);
        assertEq(token.nftMinted(0), 1 * 1e18);
    }

    function testPausedMinting() public {
        // Create a DAO
        vm.prank(daoOwner);
        factory.createDao(
            "uri1",
            "Token1",
            "TKN1",
            1000 * 1e18,
            0.1 ether,
            1000 * 1e18
        );

        DaoFactory.Dao memory dao = factory.getDao(0);
        DaoToken token = DaoToken(dao.token);
        MegaETH nft = MegaETH(dao.nft);

        // Mint NFT to user
        address user1 = address(0x1234);
        vm.prank(daoOwner);
        nft.mint(user1);
        vm.deal(user1, 1 ether);

        // Pause minting
        vm.prank(daoOwner);
        token.pause();

        // Try to mint while paused (should revert)
        vm.prank(user1);
        vm.expectRevert("Pausable: paused");
        token.mint{value: 0.1 ether}(0, 1 * 1e18);

        // Unpause and try again (should succeed)
        vm.prank(daoOwner);
        token.unpause();
        vm.prank(user1);
        token.mint{value: 0.1 ether}(0, 1 * 1e18);

        assertEq(token.balanceOf(user1), 1 * 1e18);
    }
}
