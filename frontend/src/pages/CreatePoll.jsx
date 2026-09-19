import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPoll } from "../services/api";

function CreatePoll() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const addOption = () => {
    if (options.length >= 6) {
      setError("You can add a maximum of 6 options.");
      return;
    }

    setOptions([...options, ""]);
    setError("");
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      setError("A poll must have at least 2 options.");
      return;
    }

    const updatedOptions = options.filter(
      (_, optionIndex) => optionIndex !== index
    );

    setOptions(updatedOptions);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const trimmedQuestion = question.trim();

    const trimmedOptions = options
      .map((option) => option.trim())
      .filter((option) => option !== "");

    if (!trimmedQuestion) {
      setError("Please enter a poll question.");
      return;
    }

    if (trimmedOptions.length < 2) {
      setError("Please provide at least 2 options.");
      return;
    }

    const uniqueOptions = new Set(
      trimmedOptions.map((option) => option.toLowerCase())
    );

    if (uniqueOptions.size !== trimmedOptions.length) {
      setError("Poll options must be unique.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await createPoll({
        question: trimmedQuestion,
        options: trimmedOptions,
      });

      console.log("Created poll:", data.poll);

      alert("Poll created successfully!");

      navigate(`/poll/${data.poll.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

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

          <Link
            to="/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Back to dashboard
          </Link>

        </div>
      </nav>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-6 py-10 sm:py-14">

        {/* Header */}
        <div className="mb-8">

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Create a poll
          </h1>

          <p className="mt-2 text-slate-500 text-sm">
            Ask a question and give your audience some options.
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm shadow-slate-900/5"
        >

          {/* Question */}
          <div className="mb-8">

            <label
              htmlFor="question"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Poll question
            </label>

            <textarea
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="e.g. What should we eat tonight?"
              rows={3}
              maxLength={200}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />

            <div className="flex justify-end mt-1.5">
              <span className="text-xs text-slate-400">
                {question.length}/200
              </span>
            </div>

          </div>

          {/* Options */}
          <div>

            <div className="flex items-center justify-between mb-3">

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Poll options
                </label>

                <p className="text-xs text-slate-500 mt-1">
                  Add between 2 and 6 options.
                </p>
              </div>

              <span className="text-xs text-slate-400">
                {options.length}/6
              </span>

            </div>

            <div className="space-y-3">

              {options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3"
                >

                  <div className="flex-1">

                    <input
                      type="text"
                      value={option}
                      onChange={(event) =>
                        handleOptionChange(index, event.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      maxLength={100}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                    />

                  </div>

                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
                    aria-label={`Remove option ${index + 1}`}
                  >
                    ×
                  </button>

                </div>
              ))}

            </div>

            {/* Add Option */}
            <button
              type="button"
              onClick={addOption}
              disabled={options.length >= 6}
              className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              + Add another option
            </button>

          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-3">

            <Link
              to="/dashboard"
              className="flex-1 text-center px-5 py-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-5 py-3 bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
            >
              {submitting ? "Creating…" : "Create poll"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default CreatePoll;
