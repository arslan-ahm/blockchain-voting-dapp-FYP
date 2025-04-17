import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { connectWallet, fetchCampaigns, registerForCampaign, vote, clearError } from '../../store/slices/voting.slice';
import { IMAGES } from '../../constants/assets';
import { useEffect } from 'react';

function Home() {
  const { account, role, campaigns, error, isConnected, hasVoted, status } = useSelector((state) => state.voting);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && account) {
      dispatch(fetchCampaigns(account));
    }
  }, [isConnected, account, dispatch]);

  const handleConnectWallet = () => {
    dispatch(connectWallet());
  };

  const handleVote = (campaignId, candidateAddress) => {
    dispatch(vote({ campaignId, candidateAddress }));
  };

  const handleRegister = (campaignId) => {
    dispatch(registerForCampaign(campaignId));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">Voting App</h1>
        {account && (
          <button
            onClick={() => navigate('/profile')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-semibold"
          >
            Profile
          </button>
        )}
      </div>
      {!isConnected ? (
        <div className="flex flex-col justify-center items-center text-center">
          <p className="mb-4 text-lg">Please connect your MetaMask wallet to continue.</p>
          <button
            onClick={handleConnectWallet}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-semibold"
            disabled={status === 'loading'}
          >
            <img src={IMAGES.META_MASK_LOGO} className="w-6" alt="meta_mask_logo" />
            <p>Connect MetaMask</p>
          </button>
        </div>
      ) : (
        <>
          {account && (
            <p className="mb-6 text-center text-lg">
              <span className="font-semibold">Connected:</span> {account}{' '}
              <span className="font-semibold">(Role:</span> {role})
            </p>
          )}
          {error && (
            <div className="text-red-500 bg-red-100 dark:bg-red-800 p-3 rounded mb-6 text-center flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={handleClearError}
                className="text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
              >
                Clear
              </button>
            </div>
          )}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Campaigns</h2>
            {status === 'loading' ? (
              <p className="text-gray-600 dark:text-gray-400">Loading campaigns...</p>
            ) : campaigns.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No campaigns available.</p>
            ) : (
              <ul className="space-y-4">
                {campaigns.map((c) => (
                  <li key={c.id} className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <p className="font-semibold text-lg">
                      Campaign {c.id}: {c.isOpen ? 'Open' : 'Closed'}
                    </p>
                    <p className="text-sm">
                      {new Date(c.startDate * 1000).toLocaleString()} -{' '}
                      {new Date(c.endDate * 1000).toLocaleString()}
                    </p>
                    <div className="mt-2">
                      <p className="font-medium">Candidates:</p>
                      <ul className="list-disc pl-5">
                        {c.candidates.length > 0 ? (
                          c.candidates.map((cand, i) => (
                            <li key={i} className="truncate">
                              {cand}
                              {role === 'Voter' && c.isOpen && (
                                <button
                                  onClick={() => handleVote(c.id, cand)}
                                  disabled={hasVoted[c.id] || status === 'loading'}
                                  className={`ml-4 px-3 py-1 rounded text-sm font-semibold ${
                                    hasVoted[c.id]
                                      ? 'bg-gray-400 cursor-not-allowed'
                                      : 'bg-green-600 hover:bg-green-700 text-white'
                                  }`}
                                >
                                  {hasVoted[c.id] ? 'Already Voted' : 'Vote'}
                                </button>
                              )}
                            </li>
                          ))
                        ) : (
                          <li>None</li>
                        )}
                      </ul>
                    </div>
                    <div className="mt-2">
                      <p className="font-medium">Voters:</p>
                      <ul className="list-disc pl-5">
                        {c.voters.length > 0 ? (
                          c.voters.map((voter, i) => (
                            <li key={i} className="truncate">{voter}</li>
                          ))
                        ) : (
                          <li>None</li>
                        )}
                      </ul>
                    </div>
                    {(role === 'Voter' || role === 'Candidate') && c.isOpen && (
                      <button
                        onClick={() => handleRegister(c.id)}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
                        disabled={status === 'loading'}
                      >
                        Register for Campaign
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Home;