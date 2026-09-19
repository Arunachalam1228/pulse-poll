const STORAGE_KEY = "pulsepoll_polls";

// Get all polls
export function getPolls() {
  const polls = localStorage.getItem(STORAGE_KEY);

  if (!polls) {
    return [];
  }

  return JSON.parse(polls);
}

// Get one poll
export function getPollById(pollId) {
  const polls = getPolls();

  return polls.find((poll) => poll.id === pollId);
}

// Create a poll
export function createPoll(pollData) {
  const polls = getPolls();

  const newPoll = {
    id: Date.now().toString(),
    question: pollData.question,
    options: pollData.options.map((option, index) => ({
      id: `option-${index + 1}`,
      text: option,
      votes: 0,
    })),
    createdAt: new Date().toISOString(),
  };

  polls.push(newPoll);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));

  return newPoll;
}

// Update poll
export function updatePoll(updatedPoll) {
  const polls = getPolls();

  const updatedPolls = polls.map((poll) =>
    poll.id === updatedPoll.id ? updatedPoll : poll
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPolls));

  return updatedPoll;
}