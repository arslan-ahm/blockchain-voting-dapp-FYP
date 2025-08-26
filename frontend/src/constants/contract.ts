// Auto-generated contract constants
export const VOTING_CONTRACT_ADDRESS = "0x918d0a2031702fC206fb75d9D83F412B6265bB6f";
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
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalVotes",
        "type": "uint256"
      }
    ],
    "name": "CampaignClosed",
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
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
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
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "deletedBy",
        "type": "address"
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
        "internalType": "uint256",
        "name": "campaignId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "setBy",
        "type": "address"
      }
    ],
    "name": "PublicCampaignSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "campaignId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum Role",
        "name": "role",
        "type": "uint8"
      }
    ],
    "name": "UserAutoRegisteredForCampaign",
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
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "userName",
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
    "name": "CAMPAIGN_REGISTRATION_WINDOW",
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
        "internalType": "bool",
        "name": "isDeleted",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "campaignDetailsIpfsHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "campaignTitle",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "campaignDescription",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "totalVotesCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "creationTimestamp",
        "type": "uint256"
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
    "name": "candidateNames",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
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
    "inputs": [],
    "name": "cleanupPendingRequests",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "clearPublicCampaign",
    "outputs": [],
    "stateMutability": "nonpayable",
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
      },
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
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
      },
      {
        "internalType": "address",
        "name": "_adminAddress",
        "type": "address"
      }
    ],
    "name": "deleteCampaign",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveCampaignId",
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
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      }
    ],
    "name": "getCampaignCandidates",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "candidates",
        "type": "address[]"
      },
      {
        "internalType": "string[]",
        "name": "names",
        "type": "string[]"
      },
      {
        "internalType": "uint256[]",
        "name": "voteCounts",
        "type": "uint256[]"
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
        "internalType": "bool",
        "name": "isDeleted",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "detailsIpfsHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "totalVotes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "voterCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "candidateCount",
        "type": "uint256"
      },
      {
        "internalType": "enum CampaignStatus",
        "name": "status",
        "type": "uint8"
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
      }
    ],
    "name": "getCampaignVoters",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "voters",
        "type": "address[]"
      },
      {
        "internalType": "string[]",
        "name": "names",
        "type": "string[]"
      },
      {
        "internalType": "bool[]",
        "name": "hasVotedList",
        "type": "bool[]"
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
    "name": "getCandidateVotes",
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
        "internalType": "uint256",
        "name": "_month",
        "type": "uint256"
      }
    ],
    "name": "getMonthlyCampaigns",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "campaignIds",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "startDates",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "endDates",
        "type": "uint256[]"
      },
      {
        "internalType": "string[]",
        "name": "titles",
        "type": "string[]"
      },
      {
        "internalType": "enum CampaignStatus[]",
        "name": "statuses",
        "type": "uint8[]"
      },
      {
        "internalType": "address[]",
        "name": "winners",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getNearbyCampaigns",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "campaignIds",
        "type": "uint256[]"
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
      }
    ],
    "name": "getParticipantStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "candidateCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "voterCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPendingRequestsCount",
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
      },
      {
        "internalType": "string[]",
        "name": "userNames",
        "type": "string[]"
      },
      {
        "internalType": "uint256[]",
        "name": "timestamps",
        "type": "uint256[]"
      },
      {
        "components": [
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
          },
          {
            "internalType": "string[]",
            "name": "supportiveLinks",
            "type": "string[]"
          }
        ],
        "internalType": "struct UserDetails[]",
        "name": "userInfos",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPublicCampaign",
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
        "internalType": "bool",
        "name": "isDeleted",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "detailsIpfsHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "totalVotes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "voterCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "candidateCount",
        "type": "uint256"
      },
      {
        "internalType": "enum CampaignStatus",
        "name": "status",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPublicCampaignId",
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
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserVerificationStatus",
    "outputs": [
      {
        "internalType": "enum Role",
        "name": "currentRole",
        "type": "uint8"
      },
      {
        "internalType": "enum RequestStatus",
        "name": "requestStatus",
        "type": "uint8"
      },
      {
        "internalType": "enum Role",
        "name": "requestedRole",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "adminFeedback",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "requestTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "hasRequest",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVerificationRequestsForDashboard",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "pendingCount",
        "type": "uint256"
      },
      {
        "internalType": "address[]",
        "name": "recentRequests",
        "type": "address[]"
      },
      {
        "internalType": "string[]",
        "name": "recentNames",
        "type": "string[]"
      },
      {
        "internalType": "enum Role[]",
        "name": "recentRoles",
        "type": "uint8[]"
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
      }
    ],
    "name": "getVotingStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalVoters",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "votedCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "notVotedCount",
        "type": "uint256"
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
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasPendingRequest",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "isUserDetailsLocked",
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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "isUserRegisteredForCampaign",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isVoter",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isCandidate",
        "type": "bool"
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
      }
    ],
    "name": "manualCloseCampaign",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "monthlycampaigns",
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
    "inputs": [],
    "name": "publicCampaignId",
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
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      }
    ],
    "name": "switchToCampaign",
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
    "name": "userDetailsLocked",
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
      },
      {
        "internalType": "uint256",
        "name": "requestTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "userName",
        "type": "string"
      },
      {
        "components": [
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
          },
          {
            "internalType": "string[]",
            "name": "supportiveLinks",
            "type": "string[]"
          }
        ],
        "internalType": "struct UserDetails",
        "name": "userInfo",
        "type": "tuple"
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
];
export const NETWORK_CONFIG = {
  chainId: 11155111,
  networkName: "sepolia",
  rpcUrl: "https://sepolia.infura.io/v3/${process.env.VITE_INFURA_PROJECT_ID}",
  blockExplorer: "https://sepolia.etherscan.io"
};
export const ADMIN_ADDRESS = "0xA17e2C49438e44456D401243a9ACa156605B2C12";
export const DEPLOYMENT_INFO = {
  "network": "sepolia",
  "contractAddress": "0x918d0a2031702fC206fb75d9D83F412B6265bB6f",
  "adminAddress": "0xA17e2C49438e44456D401243a9ACa156605B2C12",
  "deployerAddress": "0xA17e2C49438e44456D401243a9ACa156605B2C12",
  "deploymentTimestamp": "2025-09-01T02:43:58.025Z",
  "transactionHash": "0x82dba62d8a3387a087af9406c0c2febf7b5c76380a39f94ba34d9c6befd7543a",
  "blockNumber": null,
  "gasUsed": "5201829",
  "chainId": 11155111
};
