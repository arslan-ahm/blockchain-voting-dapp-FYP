import { ethers } from "ethers";
import VotingABI from '../artifacts/Voting.json';

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const CONTRACT_ABI = VotingABI.abi;
const getContract = async () => {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

export { provider, getContract, CONTRACT_ADDRESS };