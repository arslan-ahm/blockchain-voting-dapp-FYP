// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/automation/KeeperCompatible.sol";

enum Role {
    Unverified,
    Voter,
    Candidate,
    Admin,
    PendingVerification
}
enum RequestStatus {
    Pending,
    Approved,
    Rejected
}
enum CampaignStatus {
    Upcoming,
    Active,
    Completed,
    Deleted
}

struct UserDetails {
    string name;
    string email;
    uint256 dateOfBirth;
    string identityNumber;
    string contactNumber;
    string bio;
    string profileImageIpfsHash;
    string[] supportiveLinks;
}

struct VerificationRequest {
    address userAddress;
    Role requestedRole;
    RequestStatus status;
    string verificationDocIpfsHash;
    string adminFeedback;
    uint256 requestTimestamp;
    string userName;
    UserDetails userInfo;
}

struct Campaign {
    uint256 campaignId;
    uint256 startDate;
    uint256 endDate;
    address winner;
    mapping(address => bool) registeredVoters;
    mapping(address => bool) registeredCandidates;
    mapping(address => bool) hasVoted; // New: Track who has voted
    address[] voterList;
    address[] candidateList;
    bool isOpen;
    bool isDeleted; // New: Soft delete flag
    string campaignDetailsIpfsHash;
    string campaignTitle; // New: Campaign title
    string campaignDescription; // New: Campaign description
    mapping(address => uint256) candidateVotes;
    uint256 totalVotesCount; // New: Total votes cast
    uint256 creationTimestamp; // New: When campaign was created
}

struct CampaignInfo {
    uint256 campaignId;
    uint256 startDate;
    uint256 endDate;
    address winner;
    bool isOpen;
    bool isDeleted;
    string campaignTitle;
    string campaignDescription;
    uint256 totalVotesCount;
    uint256 creationTimestamp;
    uint256 voterCount;
    uint256 candidateCount;
    CampaignStatus status;
}

contract Voting is Ownable, ReentrancyGuard, KeeperCompatibleInterface {
    mapping(address => UserDetails) public userDetails;
    mapping(address => Role) public userRoles;
    mapping(address => VerificationRequest) public verificationRequests;
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => mapping(uint256 => address)) public votes;
    mapping(address => bool) public userDetailsLocked;

    mapping(uint256 => uint256) public monthlycampaigns; // month => campaign count
    mapping(address => string) public candidateNames; // For easier candidate display
    mapping(address => bool) public hasPendingRequest;

    address[] private pendingVerificationRequests;
    uint256 public nextCampaignId = 1;
    address public admin;
    uint256 public constant CAMPAIGN_REGISTRATION_WINDOW = 7 days;
    
    // Public campaign for display
    uint256 public publicCampaignId = 0;

    event UserDetailsUpdated(address userAddress, string name, string email);
    event VerificationRequested(
        address userAddress,
        Role requestedRole,
        string verificationDocIpfsHash,
        string userName
    );
    event VerificationProcessed(
        address userAddress,
        Role role,
        RequestStatus status,
        string adminFeedback
    );
    event CampaignCreated(
        uint256 campaignId,
        uint256 startDate,
        uint256 endDate,
        string title
    );
    event CampaignDeleted(uint256 campaignId, address deletedBy);
    event VoteCast(address voter, address candidate, uint256 campaignId);
    event CampaignClosed(
        uint256 campaignId,
        address winner,
        uint256 totalVotes
    );
    event UserAutoRegisteredForCampaign(
        address user,
        uint256 campaignId,
        Role role
    );
    event PublicCampaignSet(
        uint256 campaignId,
        address setBy
    );

    constructor(address initialOwner) Ownable(initialOwner) {
    admin = initialOwner;
    userRoles[initialOwner] = Role.Admin;
    
    // Fix: Initialize the admin's user details to prevent issues
    userDetails[initialOwner] = UserDetails(
        "System Admin",
        "",
        0,
        "",
        "",
        "System Administrator",
        "",
        new string[](0)
    );
}

    // Enhanced user functions
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
        require(
            userRoles[msg.sender] == Role.Unverified ||
                userRoles[msg.sender] == Role.PendingVerification,
            "Cannot modify details after verification"
        );
        require(
            !userDetailsLocked[msg.sender],
            "User details are locked after verification"
        );

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

        // Store candidate name for easier access
        if (
            userRoles[msg.sender] == Role.Candidate ||
            userRoles[msg.sender] == Role.PendingVerification
        ) {
            candidateNames[msg.sender] = _name;
        }

        emit UserDetailsUpdated(msg.sender, _name, _email);
    }

    function requestVerification(
        Role _requestedRole,
        string memory _verificationDocIpfsHash
    ) public {
        require(
            _requestedRole == Role.Voter || _requestedRole == Role.Candidate,
            "Invalid role requested"
        );
        require(
            userRoles[msg.sender] == Role.Unverified,
            "Already verified or pending"
        );
        require(
            bytes(userDetails[msg.sender].name).length > 0,
            "Please update user details first"
        );

        verificationRequests[msg.sender] = VerificationRequest(
            msg.sender,
            _requestedRole,
            RequestStatus.Pending,
            _verificationDocIpfsHash,
            "",
            block.timestamp,
            userDetails[msg.sender].name,
            userDetails[msg.sender]
        );
        userRoles[msg.sender] = Role.PendingVerification;
        pendingVerificationRequests.push(msg.sender);
        hasPendingRequest[msg.sender] = true;
        emit VerificationRequested(
            msg.sender,
            _requestedRole,
            _verificationDocIpfsHash,
            userDetails[msg.sender].name
        );
    }

    // Enhanced admin functions
    function processVerification(
        address _userAddress,
        bool _approved,
        string memory _feedback
    ) public onlyAdmin {
        VerificationRequest storage request = verificationRequests[
            _userAddress
        ];
        require(request.status == RequestStatus.Pending, "No pending request");
        require(hasPendingRequest[_userAddress], "Request not in pending list");

        if (_approved) {
            request.status = RequestStatus.Approved;
            userRoles[_userAddress] = request.requestedRole;
            userDetailsLocked[_userAddress] = true;

            // Store candidate name if approving candidate
            if (request.requestedRole == Role.Candidate) {
                candidateNames[_userAddress] = userDetails[_userAddress].name;
            }

            _autoRegisterUserForNearbyCampaigns(
                _userAddress,
                request.requestedRole
            );
        } else {
            request.status = RequestStatus.Rejected;
            request.adminFeedback = _feedback;
            userRoles[_userAddress] = Role.Unverified;
        }

        _removePendingRequest(_userAddress);

        emit VerificationProcessed(
            _userAddress,
            request.requestedRole,
            request.status,
            _feedback
        );
    }

    function _removePendingRequest(address _userAddress) internal {
        hasPendingRequest[_userAddress] = false;

        // Find and remove the user from pendingVerificationRequests array
        for (uint256 i = 0; i < pendingVerificationRequests.length; i++) {
            if (pendingVerificationRequests[i] == _userAddress) {
                // Move last element to current position and pop
                pendingVerificationRequests[i] = pendingVerificationRequests[
                    pendingVerificationRequests.length - 1
                ];
                pendingVerificationRequests.pop();
                break;
            }
        }
    }

    function _autoRegisterUserForNearbyCampaigns(
        address _user,
        Role _role
    ) internal {
        for (uint256 i = 1; i < nextCampaignId; i++) {
            Campaign storage campaign = campaigns[i];
            if (
                campaign.campaignId != 0 &&
                campaign.isOpen &&
                !campaign.isDeleted
            ) {
                if (
                    block.timestamp <= campaign.startDate &&
                    campaign.startDate <=
                    block.timestamp + CAMPAIGN_REGISTRATION_WINDOW
                ) {
                    if (
                        _role == Role.Voter && !campaign.registeredVoters[_user]
                    ) {
                        campaign.registeredVoters[_user] = true;
                        campaign.voterList.push(_user);
                        emit UserAutoRegisteredForCampaign(
                            _user,
                            i,
                            Role.Voter
                        );
                    } else if (
                        _role == Role.Candidate &&
                        !campaign.registeredCandidates[_user]
                    ) {
                        campaign.registeredCandidates[_user] = true;
                        campaign.candidateList.push(_user);
                        emit UserAutoRegisteredForCampaign(
                            _user,
                            i,
                            Role.Candidate
                        );
                    }
                }
            }
        }
    }

    function createCampaign(
        uint256 _startDate,
        uint256 _endDate,
        string memory _campaignDetailsIpfsHash,
        string memory _title,
        string memory _description
    ) public onlyAdmin {
        require(_endDate > _startDate, "Invalid dates");
        require(_startDate > block.timestamp, "Start date must be in future");
        require(bytes(_title).length > 0, "Campaign title required");

        // Check for overlapping campaigns
        for (uint256 i = 1; i < nextCampaignId; i++) {
            Campaign storage existingCampaign = campaigns[i];
            if (
                existingCampaign.campaignId != 0 &&
                existingCampaign.isOpen &&
                !existingCampaign.isDeleted
            ) {
                bool isOverlapping = !(_endDate < existingCampaign.startDate ||
                    _startDate > existingCampaign.endDate);
                require(
                    !isOverlapping,
                    "Campaign overlaps with existing campaign"
                );
            }
        }

        Campaign storage campaign = campaigns[nextCampaignId];
        campaign.campaignId = nextCampaignId;
        campaign.startDate = _startDate;
        campaign.endDate = _endDate;
        campaign.isOpen = true;
        campaign.isDeleted = false;
        campaign.campaignDetailsIpfsHash = _campaignDetailsIpfsHash;
        campaign.campaignTitle = _title;
        campaign.campaignDescription = _description;
        campaign.creationTimestamp = block.timestamp;

        // Track monthly campaigns
        uint256 month = (_startDate / 30 days) * 30 days;
        monthlycampaigns[month]++;

        emit CampaignCreated(nextCampaignId, _startDate, _endDate, _title);
        nextCampaignId++;
    }

    function deleteCampaign(
        uint256 _campaignId,
        address _adminAddress
    ) public onlyAdmin {
        require(_adminAddress == admin, "Invalid admin address");
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.campaignId != 0, "Campaign does not exist");
        require(!campaign.isDeleted, "Campaign already deleted");
        require(
            block.timestamp < campaign.startDate,
            "Cannot delete started campaign"
        );

        campaign.isDeleted = true;
        campaign.isOpen = false;

        emit CampaignDeleted(_campaignId, msg.sender);
    }

    // Enhanced voting functions
    function registerForCampaign(uint256 _campaignId) public {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.campaignId != 0, "Campaign does not exist");
        require(
            campaign.isOpen && !campaign.isDeleted,
            "Campaign not available"
        );
        require(block.timestamp < campaign.endDate, "Campaign ended");

        bool isNearbyCampaign = (block.timestamp <= campaign.startDate &&
            campaign.startDate <=
            block.timestamp + CAMPAIGN_REGISTRATION_WINDOW) ||
            (block.timestamp >= campaign.startDate &&
                block.timestamp < campaign.endDate);
        require(isNearbyCampaign, "Campaign is not available for registration");

        if (userRoles[msg.sender] == Role.Voter) {
            require(
                !campaign.registeredVoters[msg.sender],
                "Already registered as voter"
            );
            campaign.registeredVoters[msg.sender] = true;
            campaign.voterList.push(msg.sender);
        } else if (userRoles[msg.sender] == Role.Candidate) {
            require(
                !campaign.registeredCandidates[msg.sender],
                "Already registered as candidate"
            );
            require(
                block.timestamp < campaign.startDate,
                "Cannot register as candidate after campaign starts"
            );
            campaign.registeredCandidates[msg.sender] = true;
            campaign.candidateList.push(msg.sender);
        } else {
            revert("Invalid role for registration");
        }
    }

    function vote(uint256 _campaignId, address _candidate) public nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.campaignId != 0, "Campaign does not exist");
        require(
            campaign.isOpen && !campaign.isDeleted,
            "Campaign not available"
        );
        require(block.timestamp >= campaign.startDate, "Campaign not started");
        require(block.timestamp < campaign.endDate, "Campaign ended");
        require(userRoles[msg.sender] == Role.Voter, "Not a voter");
        require(
            campaign.registeredVoters[msg.sender],
            "Not registered for this campaign"
        );
        require(
            campaign.registeredCandidates[_candidate],
            "Invalid candidate for this campaign"
        );
        require(
            votes[msg.sender][_campaignId] == address(0),
            "Already voted in this campaign"
        );

        votes[msg.sender][_campaignId] = _candidate;
        campaign.candidateVotes[_candidate]++;
        campaign.hasVoted[msg.sender] = true;
        campaign.totalVotesCount++;

        emit VoteCast(msg.sender, _candidate, _campaignId);
    }

    // Enhanced view functions
    function getCampaignDetails(
        uint256 _campaignId
    )
        public
        view
        returns (
            uint256 startDate,
            uint256 endDate,
            address winner,
            bool isOpen,
            bool isDeleted,
            string memory detailsIpfsHash,
            string memory title,
            string memory description,
            uint256 totalVotes,
            uint256 voterCount,
            uint256 candidateCount,
            CampaignStatus status
        )
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.campaignId != 0, "Campaign does not exist");

        CampaignStatus campaignStatus;
        if (campaign.isDeleted) {
            campaignStatus = CampaignStatus.Deleted;
        } else if (block.timestamp < campaign.startDate) {
            campaignStatus = CampaignStatus.Upcoming;
        } else if (
            block.timestamp >= campaign.startDate &&
            block.timestamp < campaign.endDate &&
            campaign.isOpen
        ) {
            campaignStatus = CampaignStatus.Active;
        } else {
            campaignStatus = CampaignStatus.Completed;
        }

        return (
            campaign.startDate,
            campaign.endDate,
            campaign.winner,
            campaign.isOpen,
            campaign.isDeleted,
            campaign.campaignDetailsIpfsHash,
            campaign.campaignTitle,
            campaign.campaignDescription,
            campaign.totalVotesCount,
            campaign.voterList.length,
            campaign.candidateList.length,
            campaignStatus
        );
    }

    function getCandidateVotes(
        uint256 _campaignId,
        address _candidate
    ) public view returns (uint256) {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.campaignId != 0, "Campaign does not exist");
        return campaign.candidateVotes[_candidate];
    }

    function getCampaignCandidates(
        uint256 _campaignId
    )
        public
        view
        returns (
            address[] memory candidates,
            string[] memory names,
            uint256[] memory voteCounts
        )
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.campaignId != 0, "Campaign does not exist");

        candidates = campaign.candidateList;
        names = new string[](candidates.length);
        voteCounts = new uint256[](candidates.length);

        for (uint256 i = 0; i < candidates.length; i++) {
            names[i] = candidateNames[candidates[i]];
            voteCounts[i] = campaign.candidateVotes[candidates[i]];
        }
    }

    function getCampaignVoters(
        uint256 _campaignId
    )
        public
        view
        returns (
            address[] memory voters,
            string[] memory names,
            bool[] memory hasVotedList
        )
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.campaignId != 0, "Campaign does not exist");

        voters = campaign.voterList;
        names = new string[](voters.length);
        hasVotedList = new bool[](voters.length);

        for (uint256 i = 0; i < voters.length; i++) {
            names[i] = userDetails[voters[i]].name;
            hasVotedList[i] = campaign.hasVoted[voters[i]];
        }
    }

    function getVotingStats(
        uint256 _campaignId
    )
        public
        view
        returns (uint256 totalVoters, uint256 votedCount, uint256 notVotedCount)
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.campaignId != 0, "Campaign does not exist");

        totalVoters = campaign.voterList.length;
        votedCount = campaign.totalVotesCount;
        notVotedCount = totalVoters - votedCount;
    }

    function getParticipantStats(
        uint256 _campaignId
    ) public view returns (uint256 candidateCount, uint256 voterCount) {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.campaignId != 0, "Campaign does not exist");

        candidateCount = campaign.candidateList.length;
        voterCount = campaign.voterList.length;
    }

    function getMonthlyCampaigns(
        uint256 _month
    )
        public
        view
        returns (
            uint256[] memory campaignIds,
            uint256[] memory startDates,
            uint256[] memory endDates,
            string[] memory titles,
            CampaignStatus[] memory statuses,
            address[] memory winners
        )
    {
        uint256[] memory tempIds = new uint256[](nextCampaignId - 1);
        uint256 count = 0;

        for (uint256 i = 1; i < nextCampaignId; i++) {
            Campaign storage campaign = campaigns[i];
            if (campaign.campaignId != 0 && !campaign.isDeleted) {
                uint256 campaignMonth = (campaign.startDate / 30 days) *
                    30 days;
                if (campaignMonth == _month) {
                    tempIds[count] = i;
                    count++;
                }
            }
        }

        campaignIds = new uint256[](count);
        startDates = new uint256[](count);
        endDates = new uint256[](count);
        titles = new string[](count);
        statuses = new CampaignStatus[](count);
        winners = new address[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 id = tempIds[i];
            Campaign storage campaign = campaigns[id];
            campaignIds[i] = id;
            startDates[i] = campaign.startDate;
            endDates[i] = campaign.endDate;
            titles[i] = campaign.campaignTitle;
            winners[i] = campaign.winner;

            if (block.timestamp < campaign.startDate) {
                statuses[i] = CampaignStatus.Upcoming;
            } else if (
                block.timestamp >= campaign.startDate &&
                block.timestamp < campaign.endDate &&
                campaign.isOpen
            ) {
                statuses[i] = CampaignStatus.Active;
            } else {
                statuses[i] = CampaignStatus.Completed;
            }
        }
    }

    function getUserVerificationStatus(
        address _user
    )
        public
        view
        returns (
            Role currentRole,
            RequestStatus requestStatus,
            Role requestedRole,
            string memory adminFeedback,
            uint256 requestTimestamp,
            bool hasRequest
        )
    {
        VerificationRequest memory request = verificationRequests[_user];
        return (
            userRoles[_user],
            request.status,
            request.requestedRole,
            request.adminFeedback,
            request.requestTimestamp,
            hasPendingRequest[_user]
        );
    }

    function getNearbyCampaigns()
        public
        view
        returns (uint256[] memory campaignIds)
    {
        uint256[] memory tempIds = new uint256[](nextCampaignId - 1);
        uint256 count = 0;

        for (uint256 i = 1; i < nextCampaignId; i++) {
            Campaign storage campaign = campaigns[i];
            if (
                campaign.campaignId != 0 &&
                campaign.isOpen &&
                !campaign.isDeleted
            ) {
                bool isNearby = (block.timestamp <= campaign.startDate &&
                    campaign.startDate <=
                    block.timestamp + CAMPAIGN_REGISTRATION_WINDOW) ||
                    (block.timestamp >= campaign.startDate &&
                        block.timestamp < campaign.endDate);
                if (isNearby) {
                    tempIds[count] = i;
                    count++;
                }
            }
        }

        campaignIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            campaignIds[i] = tempIds[i];
        }
    }

    function getPendingVerificationRequests()
        public
        view
        onlyAdmin
        returns (
            address[] memory userAddresses,
            Role[] memory requestedRoles,
            string[] memory verificationDocIpfsHashes,
            string[] memory adminFeedbacks,
            string[] memory userNames,
            uint256[] memory timestamps,
            UserDetails[] memory userInfos
        )
    {
        uint256 validCount = 0;
        for (uint256 i = 0; i < pendingVerificationRequests.length; i++) {
            address user = pendingVerificationRequests[i];
            if (
                verificationRequests[user].status == RequestStatus.Pending &&
                hasPendingRequest[user]
            ) {
                validCount++;
            }
        }

        userAddresses = new address[](validCount);
        requestedRoles = new Role[](validCount);
        verificationDocIpfsHashes = new string[](validCount);
        adminFeedbacks = new string[](validCount);
        userNames = new string[](validCount);
        timestamps = new uint256[](validCount);
        userInfos = new UserDetails[](validCount);

        uint256 index = 0;
        for (uint256 i = 0; i < pendingVerificationRequests.length; i++) {
            address user = pendingVerificationRequests[i];
            VerificationRequest memory request = verificationRequests[user];

            if (
                request.status == RequestStatus.Pending &&
                hasPendingRequest[user]
            ) {
                userAddresses[index] = user;
                requestedRoles[index] = request.requestedRole;
                verificationDocIpfsHashes[index] = request
                    .verificationDocIpfsHash;
                adminFeedbacks[index] = request.adminFeedback;
                userNames[index] = request.userName;
                timestamps[index] = request.requestTimestamp;
                userInfos[index] = request.userInfo;
                index++;
            }
        }
    }

    function getVerificationRequestsForDashboard()
        public
        view
        onlyAdmin
        returns (
            uint256 pendingCount,
            address[] memory recentRequests,
            string[] memory recentNames,
            Role[] memory recentRoles
        )
    {
        pendingCount = getPendingRequestsCount();

        // Get up to 5 most recent requests for dashboard display
        uint256 displayCount = pendingCount > 5 ? 5 : pendingCount;
        recentRequests = new address[](displayCount);
        recentNames = new string[](displayCount);
        recentRoles = new Role[](displayCount);

        uint256 index = 0;
        // Start from the end to get most recent requests first
        for (
            int256 i = int256(pendingVerificationRequests.length) - 1;
            i >= 0 && index < displayCount;
            i--
        ) {
            address user = pendingVerificationRequests[uint256(i)];
            if (
                verificationRequests[user].status == RequestStatus.Pending &&
                hasPendingRequest[user]
            ) {
                recentRequests[index] = user;
                recentNames[index] = verificationRequests[user].userName;
                recentRoles[index] = verificationRequests[user].requestedRole;
                index++;
            }
        }
    }

    function getPendingRequestsCount() public view onlyAdmin returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < pendingVerificationRequests.length; i++) {
            address user = pendingVerificationRequests[i];
            if (
                verificationRequests[user].status == RequestStatus.Pending &&
                hasPendingRequest[user]
            ) {
                count++;
            }
        }
        return count;
    }

    function cleanupPendingRequests() public onlyAdmin {
        address[] memory validRequests = new address[](
            pendingVerificationRequests.length
        );
        uint256 validCount = 0;

        for (uint256 i = 0; i < pendingVerificationRequests.length; i++) {
            address user = pendingVerificationRequests[i];
            if (
                verificationRequests[user].status == RequestStatus.Pending &&
                hasPendingRequest[user]
            ) {
                validRequests[validCount] = user;
                validCount++;
            } else {
                // Clean up inconsistent state
                hasPendingRequest[user] = false;
            }
        }

        // Resize the array
        delete pendingVerificationRequests;
        for (uint256 i = 0; i < validCount; i++) {
            pendingVerificationRequests.push(validRequests[i]);
        }
    }

    // Chainlink Keeper functions
    function checkUpkeep(
        bytes memory
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        upkeepNeeded = false;
        performData = "";

        if (nextCampaignId <= 1) {
            return (false, "");
        }

        for (uint256 i = 1; i < nextCampaignId; i++) {
            Campaign storage campaign = campaigns[i];
            if (
                campaign.campaignId != 0 &&
                campaign.isOpen &&
                !campaign.isDeleted &&
                block.timestamp >= campaign.endDate
            ) {
                upkeepNeeded = true;
                performData = abi.encode(i);
                break;
            }
        }

        return (upkeepNeeded, performData);
    }

    function performUpkeep(bytes memory performData) external override {
        uint256 campaignId = abi.decode(performData, (uint256));
        Campaign storage campaign = campaigns[campaignId];
        require(
            campaign.campaignId != 0 &&
                campaign.isOpen &&
                !campaign.isDeleted &&
                block.timestamp >= campaign.endDate,
            "Invalid upkeep"
        );
        closeCampaign(campaignId);
    }

    function closeCampaign(uint256 _campaignId) internal {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.isOpen, "Campaign already closed");

        campaign.isOpen = false;
        address winner = calculateWinner(_campaignId);
        campaign.winner = winner;

        emit CampaignClosed(_campaignId, winner, campaign.totalVotesCount);
    }

    function calculateWinner(
        uint256 _campaignId
    ) internal view returns (address) {
        Campaign storage campaign = campaigns[_campaignId];
        address winner = address(0);
        uint256 maxVotes = 0;

        for (uint256 i = 0; i < campaign.candidateList.length; i++) {
            address candidate = campaign.candidateList[i];
            if (campaign.candidateVotes[candidate] > maxVotes) {
                maxVotes = campaign.candidateVotes[candidate];
                winner = candidate;
            }
        }
        return winner;
    }

    function manualCloseCampaign(uint256 _campaignId) public onlyAdmin {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.campaignId != 0, "Campaign does not exist");
        require(campaign.isOpen, "Campaign already closed");
        closeCampaign(_campaignId);
    }

    function hasActiveCampaign() public view returns (bool) {
    for (uint256 i = 1; i < nextCampaignId; i++) {
        Campaign storage campaign = campaigns[i];
        if (
            campaign.campaignId != 0 &&
            campaign.isOpen &&
            !campaign.isDeleted &&
            block.timestamp >= campaign.startDate &&
            block.timestamp < campaign.endDate
        ) {
            return true;
        }
    }
    return false;
}

    function getActiveCampaignId() public view returns (uint256) {
    for (uint256 i = 1; i < nextCampaignId; i++) {
        Campaign storage campaign = campaigns[i];
        if (
            campaign.campaignId != 0 &&
            campaign.isOpen &&
            !campaign.isDeleted &&
            block.timestamp >= campaign.startDate &&
            block.timestamp < campaign.endDate
        ) {
            return i;
        }
    }
    return 0;
}

    function isUserRegisteredForCampaign(
        uint256 _campaignId,
        address _user
    ) public view returns (bool isVoter, bool isCandidate) {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.registeredVoters[_user],
            campaign.registeredCandidates[_user]
        );
    }

    function isUserDetailsLocked(address _user) public view returns (bool) {
        return userDetailsLocked[_user];
    }

    // Add these functions before the modifier onlyAdmin() at the end
    
    // Set public campaign for display
    function switchToCampaign(uint256 _campaignId) public onlyAdmin {
    require(_campaignId > 0, "Invalid campaign ID");
    require(_campaignId < nextCampaignId, "Campaign ID out of range");
    require(campaigns[_campaignId].campaignId != 0, "Campaign does not exist");
    require(!campaigns[_campaignId].isDeleted, "Cannot set deleted campaign as public");
    
    publicCampaignId = _campaignId;
    emit PublicCampaignSet(_campaignId, msg.sender);
}
    
    // Get public campaign ID
    function getPublicCampaignId() public view returns (uint256) {
        return publicCampaignId;
    }
    
    // Get public campaign details
    function getPublicCampaign() public view returns (
    uint256 campaignId,
    uint256 startDate,
    uint256 endDate,
    address winner,
    bool isOpen,
    bool isDeleted,
    string memory detailsIpfsHash,
    string memory title,
    string memory description,
    uint256 totalVotes,
    uint256 voterCount,
    uint256 candidateCount,
    CampaignStatus status
) {
    if (publicCampaignId == 0) {
        // Return empty campaign if no public campaign is set
        return (0, 0, 0, address(0), false, false, "", "", "", 0, 0, 0, CampaignStatus.Upcoming);
    }
    
    // Fix: Add campaignId to the return values
    (
        startDate,
        endDate,
        winner,
        isOpen,
        isDeleted,
        detailsIpfsHash,
        title,
        description,
        totalVotes,
        voterCount,
        candidateCount,
        status
    ) = getCampaignDetails(publicCampaignId);
    
    campaignId = publicCampaignId;
    
    return (
        campaignId,
        startDate,
        endDate,
        winner,
        isOpen,
        isDeleted,
        detailsIpfsHash,
        title,
        description,
        totalVotes,
        voterCount,
        candidateCount,
        status
    );
}
    
    // Clear public campaign (admin only)
    function clearPublicCampaign() public onlyAdmin {
        publicCampaignId = 0;
        emit PublicCampaignSet(0, msg.sender);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Admin only");
        _;
    }
}
