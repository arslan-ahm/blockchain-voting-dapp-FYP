export const VOTING_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;


export const VOTING_CONTRACT_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "initialOwner",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "campaignId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "startDate",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "endDate",
                "type": "uint256"
            }
        ],
        "name": "CampaignCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "campaignId",
                "type": "uint256"
            }
        ],
        "name": "CampaignDeleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "userAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "email",
                "type": "string"
            }
        ],
        "name": "UserDetailsUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "userAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "enum Role",
                "name": "role",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "enum RequestStatus",
                "name": "status",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "adminFeedback",
                "type": "string"
            }
        ],
        "name": "VerificationProcessed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "userAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "enum Role",
                "name": "requestedRole",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "verificationDocIpfsHash",
                "type": "string"
            }
        ],
        "name": "VerificationRequested",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "voter",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "candidate",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "campaignId",
                "type": "uint256"
            }
        ],
        "name": "VoteCast",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "admin",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "campaigns",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "campaignId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "startDate",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "endDate",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "winner",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "isOpen",
                "type": "bool"
            },
            {
                "internalType": "string",
                "name": "campaignDetailsIpfsHash",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "candidateVoteCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "name": "checkUpkeep",
        "outputs": [
            {
                "internalType": "bool",
                "name": "upkeepNeeded",
                "type": "bool"
            },
            {
                "internalType": "bytes",
                "name": "performData",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_startDate",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_endDate",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "_campaignDetailsIpfsHash",
                "type": "string"
            }
        ],
        "name": "createCampaign",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_campaignId",
                "type": "uint256"
            }
        ],
        "name": "deleteCampaign",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_campaignId",
                "type": "uint256"
            }
        ],
        "name": "getCampaignDetails",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "startDate",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "endDate",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "winner",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "isOpen",
                "type": "bool"
            },
            {
                "internalType": "string",
                "name": "detailsIpfsHash",
                "type": "string"
            },
            {
                "internalType": "address[]",
                "name": "voters",
                "type": "address[]"
            },
            {
                "internalType": "address[]",
                "name": "candidates",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPendingVerificationRequests",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "userAddresses",
                "type": "address[]"
            },
            {
                "internalType": "enum Role[]",
                "name": "requestedRoles",
                "type": "uint8[]"
            },
            {
                "internalType": "string[]",
                "name": "verificationDocIpfsHashes",
                "type": "string[]"
            },
            {
                "internalType": "string[]",
                "name": "adminFeedbacks",
                "type": "string[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "hasActiveCampaign",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nextCampaignId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "performData",
                "type": "bytes"
            }
        ],
        "name": "performUpkeep",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_userAddress",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "_approved",
                "type": "bool"
            },
            {
                "internalType": "string",
                "name": "_feedback",
                "type": "string"
            }
        ],
        "name": "processVerification",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_campaignId",
                "type": "uint256"
            }
        ],
        "name": "registerForCampaign",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "enum Role",
                "name": "_requestedRole",
                "type": "uint8"
            },
            {
                "internalType": "string",
                "name": "_verificationDocIpfsHash",
                "type": "string"
            }
        ],
        "name": "requestVerification",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_name",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_email",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_dateOfBirth",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "_identityNumber",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_contactNumber",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_bio",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_profileImageIpfsHash",
                "type": "string"
            },
            {
                "internalType": "string[]",
                "name": "_supportiveLinks",
                "type": "string[]"
            }
        ],
        "name": "updateUserDetails",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "userDetails",
        "outputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "email",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "dateOfBirth",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "identityNumber",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "contactNumber",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "bio",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "profileImageIpfsHash",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "userRoles",
        "outputs": [
            {
                "internalType": "enum Role",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "verificationRequests",
        "outputs": [
            {
                "internalType": "address",
                "name": "userAddress",
                "type": "address"
            },
            {
                "internalType": "enum Role",
                "name": "requestedRole",
                "type": "uint8"
            },
            {
                "internalType": "enum RequestStatus",
                "name": "status",
                "type": "uint8"
            },
            {
                "internalType": "string",
                "name": "verificationDocIpfsHash",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "adminFeedback",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_campaignId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_candidate",
                "type": "address"
            }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "votes",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]