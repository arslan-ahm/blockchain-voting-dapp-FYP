import { Shield, User, Globe, Zap, Check, Vote, Wallet, Clock, Calendar } from 'lucide-react';

export const features = [
  {
    title: 'Blockchain Security',
    description: 'All votes are securely recorded on the blockchain, making them immutable and immune to tampering.',
    icon: Shield,
  },
  {
    title: 'Anonymous Voting',
    description: 'Cast your vote anonymously while ensuring the system can verify your eligibility.',
    icon: User,
  },
  {
    title: 'Multi-chain Support',
    description: 'Support for multiple blockchain networks including Ethereum, Polygon, and Solana.',
    icon: Globe,
  },
  {
    title: 'Real-time Results',
    description: 'View voting results in real-time as they are recorded on the blockchain.',
    icon: Zap,
  },
  {
    title: 'Role-based Access',
    description: 'Different permissions for voters, candidates, and administrators.',
    icon: Check,
  },
  {
    title: 'Decentralized Verification',
    description: 'Votes are verified by a decentralized network, ensuring maximum security.',
    icon: Vote,
  }
];

export const steps = [
  {
    title: 'Connect Your Wallet',
    description: 'Link your crypto wallet to authenticate and enable secure voting.',
    icon: Wallet,
  },
  {
    title: 'Verify Your Identity',
    description: 'Complete the verification process to ensure you are eligible to participate.',
    icon: User,
  },
  {
    title: 'Cast Your Vote',
    description: 'Select your preferred candidate or option and submit your vote securely.',
    icon: Vote,
  },
  {
    title: 'Track Results',
    description: 'Monitor the voting results in real-time as they are recorded on the blockchain.',
    icon: Clock,
  }
];

export const roadmapItems = [
  {
    phase: 'Q2 2025',
    title: 'Platform Launch',
    description: 'Initial launch with core voting functionality and Ethereum support.',
    icon: Vote,
  },
  {
    phase: 'Q3 2025',
    title: 'Multi-chain Expansion',
    description: 'Adding support for Polygon, Solana, and other major blockchains.',
    icon: Globe,
  },
  {
    phase: 'Q4 2025',
    title: 'Enterprise Solutions',
    description: 'Custom solutions for organizations, governments, and institutions.',
    icon: User,
  },
  {
    phase: 'Q1 2026',
    title: 'Mobile App Release',
    description: 'Native mobile applications for iOS and Android platforms.',
    icon: Calendar,
  }
]; 