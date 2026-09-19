import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyPolls, getPollResults } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyPolls();

        const pollsWithResults = await Promise.all(
          data.polls.map(async (poll) => {
            try {
              const result = await getPollResults(poll.id);

              return {
                ...poll,
                options: result.options,
              };
            } catch (err) {
              console.error(
                `Failed to load results for poll ${poll.id}:`,
                err
              );

              return poll;
            }
          })
        );

        setPolls(pollsWithResults);
      } catch (err) {
        setError(err.message);

        if (
          err.message.includes("token") ||
          err.message.includes("Authentication") ||
          err.message.includes("Unauthorized")
        ) {
          localStorage.removeItem("pulsepoll_token");
          localStorage.removeItem("pulsepoll_user");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("pulsepoll_token");
    localStorage.removeItem("pulsepoll_user");

    navigate("/login");
  };

  const totalVotes = polls.reduce((total, poll) => {
    const pollVotes = poll.options.reduce(
      (sum, option) => sum + (option.votes || 0),
      0
    );

    return total + pollVotes;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />

          <p className="text-slate-500 mt-4 text-sm">
            Loading your polls…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2 group">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60 group-hover:animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              PulsePoll
            </span>
          </Link>

          <div className="flex items-center gap-4">

            <span className="text-sm text-slate-500 hidden sm:block">
              Welcome back
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Logout
            </button>

          </div>

        </div>
      </nav>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Your polls
            </h1>

            <p className="text-slate-500 mt-2 text-sm">
              Create and manage your polls.
            </p>
          </div>

          <Link
            to="/create-poll"
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors shadow-sm shadow-indigo-600/20"
          >
            + Create poll
          </Link>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-900/5">
            <p className="text-sm text-slate-500">
              Total polls
            </p>

            <p className="text-3xl font-semibold text-slate-900 mt-2">
              {polls.length}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-900/5">
            <p className="text-sm text-slate-500">
              Total votes
            </p>

            <p className="text-3xl font-semibold text-slate-900 mt-2">
              {totalVotes}
            </p>
          </div>

        </div>

        {/* Poll List */}
        {polls.length === 0 ? (

          <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center shadow-sm shadow-slate-900/5">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-slate-900 mt-5">
              No polls yet
            </h2>

            <p className="text-slate-500 mt-2 text-sm">
              Create your first poll and start collecting votes.
            </p>

            <Link
              to="/create-poll"
              className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors shadow-sm shadow-indigo-600/20"
            >
              Create your first poll
            </Link>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {polls.map((poll) => {

              const votes = poll.options.reduce(
                (total, option) =>
                  total + (option.votes || 0),
                0
              );

              return (
                <div
                  key={poll.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-900/5 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-900/5 transition-all"
                >

                  {/* Poll Question */}
                  <h2 className="text-lg font-semibold text-slate-900">
                    {poll.question}
                  </h2>

                  {/* Poll Info */}
                  <div className="flex items-center gap-3 mt-3 text-sm text-slate-500">

                    <span>
                      {poll.options.length} options
                    </span>

                    <span className="text-slate-300">
                      •
                    </span>

                    <span>
                      {votes}{" "}
                      {votes === 1 ? "vote" : "votes"}
                    </span>

                  </div>

                  {/* Options Preview */}
                  <div className="mt-5 space-y-2">

                    {poll.options
                      .slice(0, 3)
                      .map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl text-sm"
                        >

                          <span className="text-slate-700">
                            {option.text}
                          </span>

                          <span className="font-semibold text-slate-500">
                            {option.votes || 0}
                          </span>

                        </div>
                      ))}

                    {poll.options.length > 3 && (
                      <p className="text-xs text-slate-400">
                        + {poll.options.length - 3} more options
                      </p>
                    )}

                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-6">

                    <Link
                      to={`/poll/${poll.id}`}
                      className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
                    >
                      View poll
                    </Link>

                    <Link
                      to={`/poll/${poll.id}/results`}
                      className="flex-1 text-center border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl transition-colors"
                    >
                      Results
                    </Link>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </main>

    </div>
  );
}

export default Dashboard;
