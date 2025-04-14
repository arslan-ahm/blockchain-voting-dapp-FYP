// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

enum Role { Unverified, Voter, Candidate, Admin, PendingVerification }
enum RequestStatus { Pending, Approved, Rejected }

struct UserDetails {
    string name;
    string email;
    uint256 dateOfBirth;
    string identityNumber;
    string contactNumber;
    string bio;
    string profileImageIpfsHash;
    string[] supportiveLinks;  // Array of links (label,url concatenated with separator)
}

struct VerificationRequest {
    address userAddress;
    Role requestedRole;
    RequestStatus status;
    string verificationDocIpfsHash;
    string adminFeedback;
}

struct Campaign {
    uint256 campaignId;
    uint256 startDate;
    uint256 endDate;
    address winner;
    mapping(address => bool) registeredVoters;
    mapping(address => bool) registeredCandidates;
    address[] voterList;
    address[] candidateList;
    bool isOpen;
    string campaignDetailsIpfsHash;
}

contract Voting is Ownable, ReentrancyGuard, KeeperCompatibleInterface {
    mapping(address => UserDetails) public userDetails;
    mapping(address => Role) public userRoles;
    mapping(address => VerificationRequest) public verificationRequests;
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => mapping(uint256 => address)) public votes; // voter -> campaign -> candidate
    mapping(address => uint256) public candidateVoteCount; // candidate -> total votes

    address[] private pendingVerificationRequests;
    uint256 public nextCampaignId = 1;
    address public admin;

    event UserDetailsUpdated(address userAddress, string name, string email);
    event VerificationRequested(address userAddress, Role requestedRole, string verificationDocIpfsHash);
    event VerificationProcessed(address userAddress, Role role, RequestStatus status, string adminFeedback);
    event CampaignCreated(uint256 campaignId, uint256 startDate, uint256 endDate);
    event CampaignDeleted(uint256 campaignId);
    event VoteCast(address voter, address candidate, uint256 campaignId);

    constructor(address initialOwner) Ownable(initialOwner) {
        admin = initialOwner;
        userRoles[initialOwner] = Role.Admin;
    }

    // User functions
    function updateUserDetails(
        string memory _name,
        string memory _email,
        uint256 _dateOfBirth,
        string memory _identityNumber,
        string memory _contactNumber,
        string memory _bio,
        string memory _profileImageIpfsHash,
        string[] memory _supportiveLinks
    ) public {
        require(userRoles[msg.sender] == Role.Unverified || userRoles[msg.sender] == Role.PendingVerification, 
            "Cannot modify details after verification");
        
        userDetails[msg.sender] = UserDetails(
            _name,
            _email,
            _dateOfBirth,
            _identityNumber,
            _contactNumber,
            _bio,
            _profileImageIpfsHash,
            _supportiveLinks
        );
        emit UserDetailsUpdated(msg.sender, _name, _email);
    }

    function requestVerification(Role _requestedRole, string memory _verificationDocIpfsHash) public {
        require(hasActiveCampaign(), "No active campaign running");
        require(_requestedRole == Role.Voter || _requestedRole == Role.Candidate, "Invalid role requested");
        require(userRoles[msg.sender] == Role.Unverified, "Already verified or pending");
        
        verificationRequests[msg.sender] = VerificationRequest(
            msg.sender,
            _requestedRole,
            RequestStatus.Pending,
            _verificationDocIpfsHash,
            ""
        );
        userRoles[msg.sender] = Role.PendingVerification;
        pendingVerificationRequests.push(msg.sender);
        emit VerificationRequested(msg.sender, _requestedRole, _verificationDocIpfsHash);
    }

    // Admin functions
    function processVerification(
        address _userAddress,
        bool _approved,
        string memory _feedback
    ) public onlyAdmin {
        require(hasActiveCampaign(), "No active campaign running");
        VerificationRequest storage request = verificationRequests[_userAddress];
        require(request.status == RequestStatus.Pending, "No pending request");
        
        if (_approved) {
            request.status = RequestStatus.Approved;
            userRoles[_userAddress] = request.requestedRole;

            // Automatically register for the latest campaign
            uint256 latestCampaignId = nextCampaignId - 1;
            if (latestCampaignId > 0 && campaigns[latestCampaignId].isOpen) {
                Campaign storage campaign = campaigns[latestCampaignId];
                if (request.requestedRole == Role.Voter) {
                    require(!campaign.registeredVoters[_userAddress], "Already registered as voter");
                    campaign.registeredVoters[_userAddress] = true;
                    campaign.voterList.push(_userAddress);
                } else if (request.requestedRole == Role.Candidate) {
                    require(!campaign.registeredCandidates[_userAddress], "Already registered as candidate");
                    campaign.registeredCandidates[_userAddress] = true;
                    campaign.candidateList.push(_userAddress);
                }
            }
        } else {
            request.status = RequestStatus.Rejected;
            request.adminFeedback = _feedback;
            userRoles[_userAddress] = Role.Unverified;
        }

        // Remove from pending requests
        for (uint256 i = 0; i < pendingVerificationRequests.length; i++) {
            if (pendingVerificationRequests[i] == _userAddress) {
                pendingVerificationRequests[i] = pendingVerificationRequests[pendingVerificationRequests.length - 1];
                pendingVerificationRequests.pop();
                break;
            }
        }

        emit VerificationProcessed(_userAddress, request.requestedRole, request.status, _feedback);
    }

    function createCampaign(
    uint256 _startDate,
    uint256 _endDate,
    string memory _campaignDetailsIpfsHash
) public onlyAdmin {
    require(_endDate > _startDate, "Invalid dates");
    
    // Check for overlapping campaigns
    for (uint256 i = 1; i < nextCampaignId; i++) {
        Campaign storage existingCampaign = campaigns[i];
        if (existingCampaign.campaignId != 0) { // Ensure campaign exists
            bool isOverlapping = !(
                _endDate < existingCampaign.startDate || 
                _startDate > existingCampaign.endDate
            );
            require(!isOverlapping, "Campaign overlaps with existing campaign");
        }
    }
    
    Campaign storage campaign = campaigns[nextCampaignId];
    campaign.campaignId = nextCampaignId;
    campaign.startDate = _startDate;
    campaign.endDate = _endDate;
    campaign.isOpen = true;
    campaign.campaignDetailsIpfsHash = _campaignDetailsIpfsHash;
    
    emit CampaignCreated(nextCampaignId, _startDate, _endDate);
    nextCampaignId++;
}

    function deleteCampaign(uint256 _campaignId) public onlyAdmin {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.isOpen, "Campaign already closed");
        require(campaign.endDate > block.timestamp, "Campaign already started");
        
        delete campaigns[_campaignId];
        emit CampaignDeleted(_campaignId);
    }

    // Voting functions
    function registerForCampaign(uint256 _campaignId) public {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.isOpen, "Campaign closed");
        require(block.timestamp >= campaign.startDate, "Campaign not started");
        
        if (userRoles[msg.sender] == Role.Voter) {
            require(!campaign.registeredVoters[msg.sender], "Already registered as voter");
            campaign.registeredVoters[msg.sender] = true;
            campaign.voterList.push(msg.sender);
        } else if (userRoles[msg.sender] == Role.Candidate) {
            require(!campaign.registeredCandidates[msg.sender], "Already registered as candidate");
            campaign.registeredCandidates[msg.sender] = true;
            campaign.candidateList.push(msg.sender);
        } else {
            revert("Invalid role");
        }
    }

    function vote(uint256 _campaignId, address _candidate) public nonReentrant {
        require(hasActiveCampaign(), "No active campaign running");
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.isOpen, "Campaign closed");
        require(userRoles[msg.sender] == Role.Voter, "Not a voter");
        require(campaign.registeredVoters[msg.sender], "Not registered");
        require(campaign.registeredCandidates[_candidate], "Invalid candidate");
        require(votes[msg.sender][_campaignId] == address(0), "Already voted");
        
        votes[msg.sender][_campaignId] = _candidate;
        candidateVoteCount[_candidate]++;
        emit VoteCast(msg.sender, _candidate, _campaignId);
    }

    // Chainlink Keeper functions
    function checkUpkeep(bytes memory) public view returns (bool upkeepNeeded, bytes memory performData) {
        for (uint256 i = 1; i < nextCampaignId; i++) {
            if (campaigns[i].isOpen && block.timestamp >= campaigns[i].endDate) {
                upkeepNeeded = true;
                performData = abi.encode(i);
                break;
            }
        }
    }

    function performUpkeep(bytes memory performData) external  {
        require(hasActiveCampaign(), "No active campaign running");
        uint256 campaignId = abi.decode(performData, (uint256));
        closeCampaign(campaignId);
    }

    function closeCampaign(uint256 _campaignId) internal {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.isOpen, "Campaign already closed");
        
        campaign.isOpen = false;
        address winner = calculateWinner(_campaignId);
        campaign.winner = winner;
        
        // Clear voter and candidate data and reset roles
        for (uint256 i = 0; i < campaign.voterList.length; i++) {
            address voter = campaign.voterList[i];
            campaign.registeredVoters[voter] = false;
            delete votes[voter][_campaignId];
            userRoles[voter] = Role.Unverified;
            delete verificationRequests[voter];
        }
        for (uint256 i = 0; i < campaign.candidateList.length; i++) {
            address candidate = campaign.candidateList[i];
            campaign.registeredCandidates[candidate] = false;
            candidateVoteCount[candidate] = 0;
            userRoles[candidate] = Role.Unverified;
            delete verificationRequests[candidate];
        }
        delete campaign.voterList;
        delete campaign.candidateList;
    }
    
    function calculateWinner(uint256 _campaignId) internal view returns (address) {
        Campaign storage campaign = campaigns[_campaignId];
        address winner = address(0);
        uint256 maxVotes = 0;
        
        for (uint256 i = 0; i < campaign.candidateList.length; i++) {
            address candidate = campaign.candidateList[i];
            if (candidateVoteCount[candidate] > maxVotes) {
                maxVotes = candidateVoteCount[candidate];
                winner = candidate;
            }
        }
        return winner;
    }

    // View functions
    function getCampaignDetails(uint256 _campaignId) public view returns (
    uint256 startDate,
    uint256 endDate,
    address winner,
    bool isOpen,
    string memory detailsIpfsHash,
    address[] memory voters,
    address[] memory candidates
) {
    Campaign storage campaign = campaigns[_campaignId];
    require(campaign.campaignId != 0, "Campaign does not exist");

    return (
        campaign.startDate,
        campaign.endDate,
        campaign.winner,
        campaign.isOpen,
        campaign.campaignDetailsIpfsHash,
        msg.sender == admin ? campaign.voterList : new address[](0),
        msg.sender == admin ? campaign.candidateList : new address[](0)
    );
}

    function hasActiveCampaign() public view returns (bool) {
        for (uint256 i = 1; i < nextCampaignId; i++) {
            if (campaigns[i].campaignId != 0 && campaigns[i].isOpen) {
                return true;
            }
        }
        return false;
    }

    function getPendingVerificationRequests() public view onlyAdmin returns (
        address[] memory userAddresses,
        Role[] memory requestedRoles,
        string[] memory verificationDocIpfsHashes,
        string[] memory adminFeedbacks
    ) {
        userAddresses = new address[](pendingVerificationRequests.length);
        requestedRoles = new Role[](pendingVerificationRequests.length);
        verificationDocIpfsHashes = new string[](pendingVerificationRequests.length);
        adminFeedbacks = new string[](pendingVerificationRequests.length);
        
        for (uint256 i = 0; i < pendingVerificationRequests.length; i++) {
            address user = pendingVerificationRequests[i];
            VerificationRequest memory request = verificationRequests[user];
            userAddresses[i] = request.userAddress;
            requestedRoles[i] = request.requestedRole;
            verificationDocIpfsHashes[i] = request.verificationDocIpfsHash;
            adminFeedbacks[i] = request.adminFeedback;
        }
        
        return (userAddresses, requestedRoles, verificationDocIpfsHashes, adminFeedbacks);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Admin only");
        _;
    }
}