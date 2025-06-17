import React, { useState } from "react";
import { StarIcon, ThumbsUpIcon, ThumbsDownIcon, SendIcon } from "lucide-react";

const FeedbackSheet = ({
  traceId,
  isVisible,
  onClose,
  onSubmit,
  isCached = false
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [rationale, setRationale] = useState("");
  const [thumbsRating, setThumbsRating] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleStarClick = (value) => {
    setRating(value);
    setThumbsRating(null); // Clear thumbs rating if star is clicked
  };

  const handleThumbsClick = (value) => {
    setThumbsRating(value);
    setRating(0); // Clear star rating if thumbs is clicked
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!traceId || (!rating && !thumbsRating)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        trace_id: traceId,
        score: rating || (thumbsRating === "up" ? 5 : 1),
        rating: thumbsRating,
        rationale: rationale.trim() || null,
        timestamp: new Date().toISOString(),
        is_cached: isCached
      };

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      setIsSubmitted(true);

      if (onSubmit) {
        onSubmit(result);
      }

      // Auto-close after showing "Thanks!" for a moment
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      // You could add error handling UI here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setRationale("");
    setThumbsRating(null);
    setIsSubmitting(false);
    setIsSubmitted(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full border border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Rate This Analysis
          </h3>

          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-white font-medium text-lg">Thanks!</p>
              <p className="text-gray-400 text-sm mt-1">
                Your feedback helps improve the system
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Overall Quality (1-5 stars)
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleStarClick(value)}
                      onMouseEnter={() => setHoveredRating(value)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <StarIcon
                        className={`w-8 h-8 transition-colors ${
                          value <= (hoveredRating || rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Thumbs Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Or use quick rating
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleThumbsClick("up")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                      thumbsRating === "up"
                        ? "bg-green-600 border-green-600 text-white"
                        : "border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-400"
                    }`}
                  >
                    <ThumbsUpIcon className="w-4 h-4" />
                    <span>Good</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleThumbsClick("down")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                      thumbsRating === "down"
                        ? "bg-red-600 border-red-600 text-white"
                        : "border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-400"
                    }`}
                  >
                    <ThumbsDownIcon className="w-4 h-4" />
                    <span>Poor</span>
                  </button>
                </div>
              </div>

              {/* Rationale Text Area */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Comments (optional)
                </label>
                <textarea
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="What did you think about this analysis? Any specific feedback?"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {rationale.length}/500 characters
                </div>
              </div>

              {/* Cached Response Warning */}
              {isCached && (rating < 4 || thumbsRating === "down") && (
                <div className="p-3 bg-yellow-900/20 border border-yellow-600/20 rounded-lg">
                  <p className="text-yellow-300 text-sm">
                    ⚠️ This was a cached response. Low ratings on cached
                    responses will dim the "Approved" badge.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={(!rating && !thumbsRating) || isSubmitting}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    (!rating && !thumbsRating) || isSubmitting
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-cyan-600 hover:bg-cyan-700 text-white"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <SendIcon className="w-4 h-4" />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Quick thumbs component for inline usage (like in TL;DR bar)
export const QuickThumbsRating = ({ traceId, onRating, className = "" }) => {
  const [rating, setRating] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleThumbsClick = async (value) => {
    if (isSubmitting || !traceId) return;

    setIsSubmitting(true);
    setRating(value);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          trace_id: traceId,
          rating: value,
          score: value === "up" ? 5 : 1,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok && onRating) {
        onRating(value);
      }
    } catch (error) {
      console.error("Failed to submit rating:", error);
      setRating(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={() => handleThumbsClick("up")}
        disabled={isSubmitting || rating === "up"}
        className={`p-1 rounded transition-colors ${
          rating === "up"
            ? "text-green-400 bg-green-900/20"
            : "text-gray-400 hover:text-green-400"
        }`}
      >
        <ThumbsUpIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleThumbsClick("down")}
        disabled={isSubmitting || rating === "down"}
        className={`p-1 rounded transition-colors ${
          rating === "down"
            ? "text-red-400 bg-red-900/20"
            : "text-gray-400 hover:text-red-400"
        }`}
      >
        <ThumbsDownIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default FeedbackSheet;
