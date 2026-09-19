import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getPoll, votePoll } from "../services/api";

function Poll() {
  const { pollId } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadPoll() {
      try {
        setLoading(true);
        setError("");

        const data = await getPoll(pollId);
        setPoll(data);

        // Check if this browser has already voted
        const votedPolls = JSON.parse(
          localStorage.getItem("pulsepoll_voted") || "[]"
        );

        if (votedPolls.includes(pollId)) {
          setHasVoted(true);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPoll();
  }, [pollId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!selectedOption) {
      setError("Please select an option.");
      return;
    }

    if (hasVoted) {
      setError("You have already voted on this poll.");
      return;
    }

    try {
      setSubmitting(true);

      // votePoll automatically sends the browser's voterId
      await votePoll(pollId, selectedOption);

      // Store this poll as voted in this browser
      const votedPolls = JSON.parse(
        localStorage.getItem("pulsepoll_voted") || "[]"
      );

      if (!votedPolls.includes(pollId)) {
        votedPolls.push(pollId);

        localStorage.setItem(
          "pulsepoll_voted",
          JSON.stringify(votedPolls)
        );
      }

      setHasVoted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Loading state ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-[3px] border-indigo-100 border-t-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading poll…</p>
        </div>
      </div>
    );
  }

  // ---------- Not found state ----------
  if (!poll) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-6 h-6 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-xl font-semibold text-slate-900">
            Poll not found
          </h1>

          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            {error || "This poll may have been deleted or does not exist."}
          </p>

          <Link
            to="/dashboard"
            className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-600/20"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ---------- Already voted state ----------
  if (hasVoted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.15)] border border-slate-100 p-8 sm:p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-7 h-7 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Vote submitted
          </h1>

          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            You've already voted on this poll. Check the live results below.
          </p>

          <div className="flex flex-col gap-3 mt-8">
            <Link
              to={`/poll/${pollId}/results`}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors shadow-sm shadow-indigo-600/20"
            >
              View live results
            </Link>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold py-3 rounded-xl transition-colors"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Voting state ----------
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span className="text-lg font-semibold text-slate-900 tracking-tight">
              PulsePoll
            </span>
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-6 py-14">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-20px_rgba(15,23,42,0.12)] p-6 sm:p-9">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            Live poll
          </div>

          <h1 className="text-2xl sm:text-[28px] font-semibold text-slate-900 tracking-tight leading-snug">
            {poll.question}
          </h1>

          <p className="text-slate-500 mt-2 mb-8 text-sm">
            Choose one option, then submit your vote.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-2.5">
              {poll.options.map((option) => {
                const isSelected = selectedOption === option.id;

                return (
                  <label
                    key={option.id}
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500"
                        : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-indigo-600"
                          : "border-slate-300"
                      }`}
                    >
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      )}
                    </span>

                    <input
                      type="radio"
                      name="pollOption"
                      value={option.id}
                      checked={isSelected}
                      onChange={(event) =>
                        setSelectedOption(event.target.value)
                      }
                      className="sr-only"
                    />

                    <span
                      className={`text-sm font-medium ${
                        isSelected ? "text-indigo-900" : "text-slate-700"
                      }`}
                    >
                      {option.text}
                    </span>
                  </label>
                );
              })}
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-7 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-3.5 rounded-xl transition-colors shadow-sm shadow-indigo-600/20"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Submitting…
                </span>
              ) : (
                "Submit vote"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Results update in real time once you vote.
        </p>
      </main>
    </div>
  );
}

export default Poll;
