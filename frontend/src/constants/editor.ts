export const DASHBOARD_CONSTANTS = {
  TITLE: "Admin Dashboard",
  VERIFICATION_REQUESTS_TITLE: "Verification Requests Over Time",
  CAMPAIGN_PARTICIPANTS_TITLE: "Campaign Participants",
  ROLE_REQUEST_DISTRIBUTION_TITLE: "Role Request Distribution",
  CREATE_CAMPAIGN_TITLE: "Create Campaign",
  MANAGE_CAMPAIGNS_TITLE: "Manage Campaigns",
  VERIFICATION_REQUESTS_TABLE_TITLE: "Verification Requests",
};

export const FORM_LABELS = {
  START_DATE: "Start Date",
  END_DATE: "End Date",
  CAMPAIGN_RULES: "Campaign Rules",
  UPLOAD_DOCUMENT: "Upload Campaign Document",
  FEEDBACK: "Feedback",
};

export const CAMPAIGN_RULES_TEMPLATE = `
<h1>Campaign Rules</h1>
<p>Welcome to the Blockchain Voting Campaign. Below are the rules and guidelines:</p>
<ul>
  <li>All participants must be verified voters or candidates.</li>
  <li>Voting is conducted securely on the blockchain.</li>
  <li>Each voter is allowed one vote per campaign.</li>
  <li>Campaign duration is from [START_DATE] to [END_DATE].</li>
  <li>Any fraudulent activity will result in disqualification.</li>
</ul>
<p>For any questions, contact the admin team.</p>
`;

export const PLACEHOLDERS = {
  START_DATE: "[START_DATE]",
  END_DATE: "[END_DATE]",
};

export const BUTTON_TEXT = {
  CREATE_CAMPAIGN: "Create Campaign",
  CREATING: "Creating...",
  APPROVE: "Approve",
  REJECT: "Reject",
  CONFIRM_APPROVAL: "Confirm Approval",
  CONFIRM_REJECTION: "Confirm Rejection",
  DELETE: "Delete",
  UPLOAD: "Upload",
  UPLOADING: "Uploading...",
};

export const TABS = {
  ALL: "all",
  CANDIDATES: "candidates",
  VOTERS: "voters",
};