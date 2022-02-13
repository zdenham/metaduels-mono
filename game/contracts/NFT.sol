// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract AdditiveNFT is ERC721URIStorage {
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
}
