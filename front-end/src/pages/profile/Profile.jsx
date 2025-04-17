import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { connectWallet, createCampaign, requestVerification, processVerification, closeCampaign, fetchPendingRequests, clearError } from '../../store/slices/voting.slice';
import { IMAGES } from '../../constants/assets';
import { useState, useEffect } from 'react';

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { account, role, pendingRequests, error, isConnected, status } = useSelector((state) => state.voting);
  const [form, setForm] = useState({
    campaignId: '',
    startDate: '',
    endDate: '',
    ipfsHash: 'Qm...',
    verificationRole: 'Voter',
    verificationDoc: 'Qm...',
    verificationUser: '',
    verificationFeedback: '',
    approveVerification: true,
  });

  useEffect(() => {
    if (isConnected && role === 'Admin') {
      dispatch(fetchPendingRequests());
    }
  }, [isConnected, role, dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleConnectWallet = () => {
    dispatch(connectWallet());
  };

  const handleCreateCampaign = () => {
    dispatch(createCampaign({ startDate: form.startDate, endDate: form.endDate, ipfsHash: form.ipfsHash }));
  };

  const handleRequestVerification = () => {
    dispatch(requestVerification({ verificationRole: form.verificationRole, verificationDoc: form.verificationDoc }));
  };

  const handleProcessVerification = () => {
    dispatch(
      processVerification({
        verificationUser: form.verificationUser,
        approveVerification: form.approveVerification,
        verificationFeedback: form.verificationFeedback,
      })
    );
  };

  const handleCloseCampaign = () => {
    dispatch(closeCampaign(form.campaignId));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">Profile</h1>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-semibold"
        >
          Home
        </button>
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
            <div className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">User Profile</h2>
              <p className="mb-2">
                <span className="font-semibold">Address:</span> {account}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Role:</span> {role}
              </p>
              {role === 'PendingVerification' && (
                <p className="text-yellow-600 dark:text-yellow-400">
                  Verification pending. Awaiting admin approval.
                </p>
              )}
            </div>
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
          {role === 'Admin' && (
            <div className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Create Campaign</h2>
              <div className="flex flex-col gap-4">
                <input
                  type="datetime-local"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleInputChange}
                  className="border p-3 rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="datetime-local"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleInputChange}
                  className="border p-3 rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="ipfsHash"
                  value={form.ipfsHash}
                  onChange={handleInputChange}
                  placeholder="Campaign IPFS Hash"
                  className="border p-3 rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCreateCampaign}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-semibold transition-colors"
                  disabled={status === 'loading'}
                >
                  Create Campaign
                </button>
              </div>
            </div>
          )}
          {(role === 'Unverified' || role === 'PendingVerification') && (
            <div className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Request Verification</h2>
              <div className="flex flex-col gap-4">
                <select
                  name="verificationRole"
                  value={form.verificationRole}
                  onChange={handleInputChange}
                  className="border p-3 rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                  disabled={role === 'PendingVerification'}
                >
                  <option value="Voter">Voter</option>
                  <option value="Candidate">Candidate</option>
                </select>
                <input
                  type="text"
                  name="verificationDoc"
                  value={form.verificationDoc}
                  onChange={handleInputChange}
                  placeholder="Verification Doc IPFS Hash"
                  className="border p-3 rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                  disabled={role === 'PendingVerification'}
                />
                <button
                  onClick={handleRequestVerification}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-semibold transition-colors"
                  disabled={role === 'PendingVerification' || status === 'loading'}
                >
                  Request Verification
                </button>
              </div>
            </div>
          )}
          {role === 'Admin' && (
            <div className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Process Verification</h2>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  name="verificationUser"
                  value={form.verificationUser}
                  onChange={handleInputChange}
                  placeholder="User Address"
                  className="border p-3 rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="verificationFeedback"
                  value={form.verificationFeedback}
                  onChange={handleInputChange}
                  placeholder="Feedback"
                  className="border p-3 rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="approveVerification"
                    checked={form.approveVerification}
                    onChange={handleInputChange}
                    className="mr-2 h-5 w-5 text-blue-600"
                  />
                  Approve
                </label>
                <button
                  onClick={handleProcessVerification}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-semibold transition-colors"
                  disabled={status === 'loading'}
                >
                  Process
                </button>
              </div>
              <h3 className="text-xl font-semibold mt-6 text-blue-600 dark:text-blue-400">Pending Requests</h3>
              <ul className="mt-4 space-y-2">
                {pendingRequests.length === 0 ? (
                  <li className="p-3 bg-gray-200 dark:bg-gray-700 rounded">No pending requests.</li>
                ) : (
                  pendingRequests.map((req, i) => (
                    <li key={i} className="p-3 bg-gray-200 dark:bg-gray-700 rounded">
                      {req.userAddress} - {req.requestedRole} (Doc: {req.docHash})
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
          {role === 'Admin' && (
            <div className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Close Campaign</h2>
              <div className="flex flex-col gap-4">
                <input
                  type="number"
                  name="campaignId"
                  value={form.campaignId}
                  onChange={handleInputChange}
                  placeholder="Campaign ID"
                  className="border p-3 rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCloseCampaign}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-semibold transition-colors"
                  disabled={status === 'loading'}
                >
                  Close Campaign
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Profile;