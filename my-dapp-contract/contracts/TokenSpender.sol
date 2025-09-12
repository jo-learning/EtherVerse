// contracts/CustomerSign.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CustomerSign {
    struct Contract {
        uint256 id;
        address creator;
        string title;
        string contentHash;
        string customerEmail;
        uint256 createdAt;
        uint256 signedAt;
        bool isSigned;
        string signature;
    }

    mapping(uint256 => Contract) public contracts;
    mapping(address => uint256[]) public userContracts;
    mapping(string => bool) public usedContentHashes;
    
    uint256 private nextContractId;
    
    event ContractCreated(uint256 indexed contractId, address indexed creator, string title);
    event ContractSigned(uint256 indexed contractId, address indexed signer, string signature);
    
    function createContract(
        string memory _title,
        string memory _contentHash,
        string memory _customerEmail
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title is required");
        require(bytes(_contentHash).length > 0, "Content hash is required");
        require(!usedContentHashes[_contentHash], "Content hash already used");
        
        uint256 contractId = nextContractId++;
        
        contracts[contractId] = Contract({
            id: contractId,
            creator: msg.sender,
            title: _title,
            contentHash: _contentHash,
            customerEmail: _customerEmail,
            createdAt: block.timestamp,
            signedAt: 0,
            isSigned: false,
            signature: ""
        });
        
        usedContentHashes[_contentHash] = true;
        userContracts[msg.sender].push(contractId);
        
        emit ContractCreated(contractId, msg.sender, _title);
        return contractId;
    }
    
    function signContract(uint256 _contractId, string memory _signature) external {
        Contract storage contractItem = contracts[_contractId];
        require(contractItem.creator != address(0), "Contract does not exist");
        require(!contractItem.isSigned, "Contract already signed");
        require(bytes(_signature).length > 0, "Signature is required");
        
        contractItem.isSigned = true;
        contractItem.signedAt = block.timestamp;
        contractItem.signature = _signature;
        
        emit ContractSigned(_contractId, msg.sender, _signature);
    }
    
    function getContract(uint256 _contractId) external view returns (
        uint256 id,
        address creator,
        string memory title,
        string memory contentHash,
        string memory customerEmail,
        uint256 createdAt,
        uint256 signedAt,
        bool isSigned,
        string memory signature
    ) {
        Contract memory c = contracts[_contractId];
        return (
            c.id,
            c.creator,
            c.title,
            c.contentHash,
            c.customerEmail,
            c.createdAt,
            c.signedAt,
            c.isSigned,
            c.signature
        );
    }
    
    function getUserContracts(address _user) external view returns (uint256[] memory) {
        return userContracts[_user];
    }
    
    function getContractsCount() external view returns (uint256) {
        return nextContractId;
    }
}