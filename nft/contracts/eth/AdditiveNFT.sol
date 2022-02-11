// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "hardhat/console.sol";

contract AdditiveNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    address private _tokenURIUpdaterAddress;
    bool private _tokenURIUpdaterLocked;
    Counters.Counter private _tokenIds;

    constructor() ERC721("AdditiveNFT", "ZODIAC") {}

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function mintNFT(string memory ipfsCid) public returns (uint256) {
        address recipient = _msgSender();
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, ipfsCid);

        return newItemId;
    }

    // burn the token address
    function lockTokenURIUpdaterForever() public onlyOwner {
        _tokenURIUpdaterLocked = true;
    }

    function setTokenURIUpdaterAddress(address newTokenURIUpdaterAddress)
        public
        onlyOwner
    {
        require(
            !_tokenURIUpdaterLocked,
            "AdditiveNFT: Token URI Updater Address is Locked Forever"
        );
        _tokenURIUpdaterAddress = newTokenURIUpdaterAddress;
    }

    function tokenURIUpdaterAddress() public view returns (address) {
        return _tokenURIUpdaterAddress;
    }

    /**
     * This should only be called AFTER we have externally validated
     *
     * 1. The new content has been signed by maybeTokenOwner (confirming their approval)
     * 2. The new CID's content is a valid addition to the current CID's content
     *
     * If the above is validated externally, we can know that a change from
     * currentCID to newCID is valid, and that the sender approved this change.
     *
     */
    function updateTokenURI(
        uint256 tokenId,
        string memory newCID,
        string memory maybeCurrentCID,
        address maybeTokenOwner
    ) public {
        require(
            _tokenURIUpdaterAddress == _msgSender(),
            "AdditiveNFT: Only the tokenURIUpdater contract can update tokenURIs"
        );

        require(
            maybeTokenOwner == ownerOf(tokenId),
            "AdditiveNFT: Attempting to update a tokenURI without owning it"
        );

        require(
            keccak256(bytes(abi.encodePacked(_baseURI(), maybeCurrentCID))) ==
                keccak256(bytes(tokenURI(tokenId))),
            "AdditiveNFT: TokenURI CID Integrity is not kept"
        );

        _setTokenURI(tokenId, newCID);
    }
}
