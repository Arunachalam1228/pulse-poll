const API_URL = "https://pulse-poll-2.onrender.com";
// Get a single poll
export async function getPoll(pollId) {
  const response = await fetch(
    `${API_URL}/api/polls/${pollId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch poll"
    );
  }

  return data.poll;
}

// Get live poll results
export async function getPollResults(pollId) {
  const response = await fetch(
    `${API_URL}/api/polls/${pollId}/results`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch poll results"
    );
  }

  return data;
}

// Vote on a poll
export async function votePoll(pollId, optionId) {
  // Get existing voter ID
  let voterId = localStorage.getItem(
    "pulsepoll_voter_id"
  );

  // Create a voter ID for this browser
  if (!voterId) {
    voterId = crypto.randomUUID();

    localStorage.setItem(
      "pulsepoll_voter_id",
      voterId
    );
  }

  const response = await fetch(
    `${API_URL}/api/polls/${pollId}/vote`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        optionId,
        voterId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to vote"
    );
  }

  return data;
}

// Create a new poll
export async function createPoll(pollData) {
  const token = localStorage.getItem(
    "pulsepoll_token"
  );

  const response = await fetch(
    `${API_URL}/api/polls/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pollData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create poll"
    );
  }

  return data;
}

// Get polls created by logged-in user
export async function getMyPolls() {
  const token = localStorage.getItem(
    "pulsepoll_token"
  );

  const response = await fetch(
    `${API_URL}/api/polls/mine`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch your polls"
    );
  }

  return data;
}