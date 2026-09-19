import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPollResults } from "../services/api";

const API_URL = "https://pulse-poll-2.onrender.com";

function Results() {
  const { pollId } = useParams();

  const [poll, setPoll] = useState(null);
  const [options, setOptions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let socket;

    async function loadResults() {
      try {
        setLoading(true);

        const data = await getPollResults(pollId);

        setPoll(data.poll);
        setOptions(data.options);

        setLoading(false);

        socket = new WebSocket(
          `${API_URL.replace("http", "ws")}/api/polls/${pollId}/ws`
        );

        socket.onmessage = (event) => {
          try {
            const update = JSON.parse(event.data);

            setOptions((currentOptions) =>
              currentOptions.map((option) =>
                option.id === update.optionId
                  ? {
                      ...option,
                      votes: update.votes,
                    }
                  : option
              )
            );
          } catch (err) {
            console.error("WebSocket update error:", err);
          }
        };

        socket.onerror = () => {
          console.error("WebSocket connection error");
        };
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    loadResults();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [pollId]);

  // Calculate total from the CURRENT options
  const totalVotes = options.reduce(
    (total, option) => total + (option.votes || 0),
    0
  );

  // Track the current leader once there are votes, for a subtle highlight
  const leaderId =
    totalVotes === 0
      ? null
      : options.reduce(
          (leader, option) =>
            (option.votes || 0) > (leader?.votes || 0) ? option : leader,
          null
        )?.id;

  // ---------- Loading state ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-[3px] border-indigo-100 border-t-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-400">
            Loading live results…
          </p>
        </div>
      </div>
    );
  }

  // ---------- Not found / error state ----------
  if (error || !poll) {
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
            {error || "This poll does not exist."}
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

  // ---------- Results state ----------
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span className="text-lg font-semibold text-slate-900 tracking-tight">
              PulsePoll
            </span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 py-14">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            Poll results
          </div>

          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
            Live results
          </h1>

          <p className="text-slate-500 mt-2 text-sm">
            {totalVotes} total {totalVotes === 1 ? "vote" : "votes"} · updating
            in real time
          </p>
        </div>

        {/* Results card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-20px_rgba(15,23,42,0.12)] p-6 sm:p-9">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight mb-8 leading-snug">
            {poll.question}
          </h2>

          <div className="space-y-6">
            {options.map((option) => {
              const votes = option.votes || 0;

              const percentage =
                totalVotes === 0
                  ? 0
                  : Math.round((votes / totalVotes) * 100);

              const isLeader = leaderId === option.id;

              return (
                <div key={option.id}>
                  <div className="flex justify-between items-baseline mb-2">
                    <span
                      className={`text-sm font-medium ${
                        isLeader ? "text-indigo-900" : "text-slate-700"
                      }`}
                    >
                      {option.text}
                    </span>

                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        isLeader ? "text-indigo-600" : "text-slate-500"
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        isLeader ? "bg-indigo-600" : "bg-indigo-300"
                      }`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <p className="text-xs text-slate-400 mt-1.5 tabular-nums">
                    {votes} {votes === 1 ? "vote" : "votes"}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <Link
              to="/dashboard"
              className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3.5 rounded-xl transition-colors shadow-sm shadow-indigo-600/20"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          This page updates instantly as new votes come in.
        </p>
      </main>
    </div>
  );
}

export default Results;
