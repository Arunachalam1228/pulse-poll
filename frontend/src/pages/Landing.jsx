import { Link } from "react-router-dom";

function LivePollPreview() {
  const options = [
    { label: "React", pct: 54 },
    { label: "Vue", pct: 28 },
    { label: "Svelte", pct: 18 },
  ];

  return (
    <div className="relative">
      {/* soft glow behind the card */}
      <div className="absolute -inset-6 bg-gradient-to-tr from-indigo-200/60 via-blue-100/40 to-transparent rounded-[2.5rem] blur-2xl" />

      <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 p-6 sm:p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-slate-400">Live poll</p>
            <h3 className="text-lg font-semibold text-slate-900 mt-0.5">
              Which framework do you use most?
            </h3>
          </div>
          <span className="flex items-center gap-1.5 pl-2.5 pr-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold shrink-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Live
          </span>
        </div>

        <div className="space-y-4">
          {options.map((opt) => (
            <div key={opt.label}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium text-slate-700">{opt.label}</span>
                <span className="font-semibold text-slate-900">{opt.pct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                  style={{ width: `${opt.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-sm">
          <span className="text-slate-400">312 votes</span>
          <span className="text-slate-400">Updating in real time</span>
        </div>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
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

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold tracking-tight leading-[1.08] text-slate-900">
                Create polls. Share them.
                <br />
                Watch responses happen live.
              </h1>

              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-lg">
                PulsePoll turns a question into a conversation. Build a poll
                in seconds, send the link to anyone, and see every vote land
                on the results screen the moment it's cast.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto text-center px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
                >
                  Create your first poll
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto text-center px-6 py-3.5 text-slate-700 font-semibold rounded-xl border border-slate-300 hover:bg-white transition-colors"
                >
                  I already have an account
                </Link>
              </div>

              <p className="mt-6 text-sm text-slate-400">
                No credit card. No installs. Just a link.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <LivePollPreview />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="max-w-xl">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Built for the moment people are watching
              </h2>
              <p className="mt-3 text-slate-600">
                Everything about PulsePoll is designed around one thing: the
                gap between a vote being cast and a result appearing.
              </p>
            </div>

            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-900/5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">
                  Results in real time
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Votes stream straight to the results screen over a live
                  connection, no refresh needed.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-900/5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342a4.5 4.5 0 010-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a4.5 4.5 0 108.463-3.163 4.5 4.5 0 00-8.463 3.163zm0 9.316a4.5 4.5 0 108.463 3.164 4.5 4.5 0 00-8.463-3.164z" />
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">
                  Share with one link
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Every poll gets its own link. Drop it in a chat, an email,
                  or on screen — no app required to vote.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-900/5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">
                  Accounts keep polls yours
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Sign in to manage every poll you've created and come back
                  to results whenever you like.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Three steps, start to finish
            </h2>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-10 md:gap-6 relative">
            <div className="hidden md:block absolute top-6 left-[16.5%] right-[16.5%] h-px bg-slate-200" />

            <div className="relative text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-white border-2 border-indigo-600 text-indigo-600 flex items-center justify-center font-semibold relative z-10">
                1
              </div>
              <h3 className="mt-5 font-semibold text-slate-900">
                Create a poll
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-[220px] mx-auto">
                Write a question, add your options, and publish it.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-white border-2 border-indigo-600 text-indigo-600 flex items-center justify-center font-semibold relative z-10">
                2
              </div>
              <h3 className="mt-5 font-semibold text-slate-900">
                Share the link
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-[220px] mx-auto">
                Send it to your audience, however you already reach them.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-white border-2 border-indigo-600 text-indigo-600 flex items-center justify-center font-semibold relative z-10">
                3
              </div>
              <h3 className="mt-5 font-semibold text-slate-900">
                Watch results live
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-[220px] mx-auto">
                Every vote updates the results screen as it comes in.
              </p>
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-slate-900">
          <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Ask your first question today
              </h2>
              <p className="mt-2 text-slate-400">
                Free to start. Live results from the first vote.
              </p>
            </div>
            <Link
              to="/register"
              className="shrink-0 px-6 py-3.5 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
            >
              Get started
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
            <span className="font-semibold text-slate-900">PulsePoll</span>
          </div>
          <p className="text-sm text-slate-400">
            © 2026 PulsePoll. Built for real-time opinions.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
