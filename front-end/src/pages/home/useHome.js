import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../../utils/web3";

const useHome = () => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [role, setRole] = useState("Unverified");
  const [campaigns, setCampaigns] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [hasVoted, setHasVoted] = useState({});

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", () => window.location.reload());
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", () => window.location.reload());
      };
    } else {
      setError("MetaMask not detected. Please install MetaMask.");
    }
  }, []);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAccount("");
      setRole("Unverified");
      setContract(null);
      setCampaigns([]);
      setPendingRequests([]);
      setHasVoted({});
    } else {
      await connectWallet();
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      setIsConnected(true);

      // Log network for debugging
      const network = await provider.getNetwork();
      console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);

      const votingContract = await getContract();
      setContract(votingContract);

      // Check user role with error handling
      let userRole = "Unverified";
      try {
        const roleId = await votingContract.userRoles(address);
        const roles = ["Unverified", "Voter", "Candidate", "Admin", "PendingVerification"];
        userRole = roles[Number(roleId)] || "Unverified";
      } catch (e) {
        console.error(`Failed to fetch user role: ${e.message}`);
        setError("Could not fetch user role. Defaulting to Unverified.");
      }

      // Verify admin status
      try {
        const adminAddress = await votingContract.admin();
        if (address.toLowerCase() === adminAddress.toLowerCase()) {
          userRole = "Admin";
        }
      } catch (e) {
        console.error(`Failed to fetch admin address: ${e.message}`);
      }
      setRole(userRole);

      await fetchCampaigns(votingContract, address);
      if (userRole === "Admin") {
        await fetchPendingRequests(votingContract);
      }
    } catch (e) {
      setError(`Wallet connection error: ${e.message}`);
      console.error("Connect wallet error:", e);
    }
  };

  const fetchCampaigns = async (votingContract, userAddress) => {
    try {
      let nextId;
      try {
        nextId = Number(await votingContract.nextCampaignId());
      } catch (e) {
        console.error(`Failed to fetch nextCampaignId: ${e.message}`);
        setError("Could not fetch campaign IDs. No campaigns loaded.");
        setCampaigns([]);
        return;
      }

      const campaignList = [];
      const votedStatus = {};
      for (let i = 1; i < nextId; i++) {
        try {
          const details = await votingContract.getCampaignDetails(i);
          campaignList.push({
            id: i,
            startDate: Number(details.startDate),
            endDate: Number(details.endDate),
            isOpen: details.isOpen,
            winner: details.winner,
            detailsIpfsHash: details.detailsIpfsHash,
            voters: details.voters || [],
            candidates: details.candidates || [],
          });
          if (userAddress && details.isOpen) {
            try {
              const voted = await votingContract.hasVoted(i, userAddress);
              votedStatus[i] = voted;
            } catch (e) {
              console.error(`Failed to check hasVoted for campaign ${i}: ${e.message}`);
              votedStatus[i] = false;
            }
          }
        } catch (e) {
          console.log(`Campaign ${i} not found: ${e.message}`);
        }
      }
      setCampaigns(campaignList);
      setHasVoted(votedStatus);
    } catch (e) {
      setError(`Fetch campaigns error: ${e.message}`);
      console.error("Fetch campaigns error:", e);
    }
  };

  const fetchPendingRequests = async (votingContract) => {
    try {
      const [userAddresses, requestedRoles, docHashes, feedbacks] =
        await votingContract.getPendingVerificationRequests();
      const requests = userAddresses.map((addr, i) => ({
        userAddress: addr,
        requestedRole: ["Unverified", "Voter", "Candidate", "Admin", "PendingVerification"][Number(requestedRoles[i]) || 0],
        docHash: docHashes[i] || "",
        feedback: feedbacks[i] || "",
      }));
      setPendingRequests(requests);
    } catch (e) {
      setError(`Fetch pending requests error: ${e.message}`);
      console.error("Fetch pending requests error:", e);
    }
  };

  const createCampaign = async (startDate, endDate, ipfsHash) => {
    if (!contract || !startDate || !endDate) {
      setError("Fill in start and end dates");
      return false;
    }
    try {
      const start = Math.floor(new Date(startDate).getTime() / 1000);
      const end = Math.floor(new Date(endDate).getTime() / 1000);
      if (end <= start) {
        setError("End date must be after start date");
        return false;
      }
      const tx = await contract.createCampaign(start, end, ipfsHash || "Qm...");
      await tx.wait();
      setError("");
      await fetchCampaigns(contract, account);
      return true;
    } catch (e) {
      setError(`Create campaign error: ${e.message}`);
      console.error("Create campaign error:", e);
      return false;
    }
  };

  const requestVerification = async (verificationRole, verificationDoc) => {
    if (!contract || !verificationDoc) {
      setError("Provide verification document IPFS hash");
      return false;
    }
    try {
      const roleId = verificationRole === "Voter" ? 1 : 2;
      const tx = await contract.requestVerification(roleId, verificationDoc);
      await tx.wait();
      setRole("PendingVerification");
      setError("");
      return true;
    } catch (e) {
      setError(`Verification request error: ${e.message}`);
      console.error("Request verification error:", e);
      return false;
    }
  };

  const processVerification = async (verificationUser, approveVerification, verificationFeedback) => {
    if (!contract || !verificationUser) {
      setError("Provide user address");
      return false;
    }
    try {
      if (!ethers.isAddress(verificationUser)) {
        setError("Invalid user address");
        return false;
      }
      const tx = await contract.processVerification(
        verificationUser,
        approveVerification,
        verificationFeedback || ""
      );
      await tx.wait();
      setError("");
      await fetchPendingRequests(contract);
      return true;
    } catch (e) {
      setError(`Process verification error: ${e.message}`);
      console.error("Process verification error:", e);
      return false;
    }
  };

  const registerForCampaign = async (campaignId) => {
    if (!contract || !campaignId) {
      setError("Provide campaign ID");
      return false;
    }
    try {
      const tx = await contract.registerForCampaign(campaignId);
      await tx.wait();
      setError("");
      await fetchCampaigns(contract, account);
      return true;
    } catch (e) {
      setError(`Register error: ${e.message}`);
      console.error("Register for campaign error:", e);
      return false;
    }
  };

  const vote = async (campaignId, candidateAddress) => {
    if (!contract || !campaignId || !candidateAddress) {
      setError("Provide campaign ID and candidate address");
      return false;
    }
    try {
      if (!ethers.isAddress(candidateAddress)) {
        setError("Invalid candidate address");
        return false;
      }
      const tx = await contract.vote(campaignId, candidateAddress);
      await tx.wait();
      setError("");
      setHasVoted((prev) => ({ ...prev, [campaignId]: true }));
      return true;
    } catch (e) {
      setError(`Vote error: ${e.message}`);
      console.error("Vote error:", e);
      return false;
    }
  };

  const closeCampaign = async (campaignId) => {
    if (!contract) {
      setError("Contract not loaded");
      return false;
    }
    try {
      const tx = await contract.performUpkeep(ethers.toUtf8Bytes(campaignId.toString()));
      await tx.wait();
      setError("");
      await fetchCampaigns(contract, account);
      return true;
    } catch (e) {
      setError(`Close campaign error: ${e.message}`);
      console.error("Close campaign error:", e);
      return false;
    }
  };

  return {
    contract,
    account,
    role,
    campaigns,
    pendingRequests,
    error,
    isConnected,
    hasVoted,
    setError,
    connectWallet,
    createCampaign,
    requestVerification,
    processVerification,
    registerForCampaign,
    vote,
    closeCampaign,
  };
};

export default useHome;