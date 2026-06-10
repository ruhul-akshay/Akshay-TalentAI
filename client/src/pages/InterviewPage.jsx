// pages/interviews.jsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

export default function InterviewsPage() {
  const { user, apiCall } = useAuth();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [formData, setFormData] = useState({
    applicant: "",
    scheduledDate: "",
    interviewType: "Online",
    meetingLink: "",
    interviewer: "",
    status: "scheduled",
    notes: "",
  });

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);

      const response = await apiCall("/api/interviews");

      if (response.ok) {
        const data = await response.json();
        setInterviews(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();

    try {
      const response = await apiCall("/api/interviews", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchInterviews();
        setShowScheduleModal(false);

        setFormData({
          applicant: "",
          scheduledDate: "",
          interviewType: "Online",
          meetingLink: "",
          interviewer: "",
          status: "scheduled",
          notes: "",
        });
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
    }
  };

  const updateInterviewStatus = async (id, status) => {
    try {
      const response = await apiCall(`/api/interviews/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchInterviews();
      }
    } catch (error) {
      console.error("Error updating interview:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500";

      case "completed":
        return "bg-green-500";

      case "cancelled":
        return "bg-red-500";

      case "pending":
        return "bg-yellow-500";

      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-14 w-14 rounded-full border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              🎤 Interview Management
            </h1>

            <p className="text-gray-400 mt-3 text-lg">
              Manage candidate interviews and schedules
            </p>
          </div>

          {/* ADMIN ONLY BUTTON */}
          {user?.role === "admin" && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300"
            >
              ➕ Schedule Interview
            </button>
          )}
        </div>

        {/* INTERVIEW LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {interviews.length === 0 ? (
            <div className="col-span-2 text-center py-20">
              <div className="text-8xl mb-6">📭</div>

              <h2 className="text-3xl text-gray-400 font-bold">
                No Interviews Scheduled
              </h2>
            </div>
          ) : (
            interviews.map((interview) => (
              <div
                key={interview._id}
                className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:border-cyan-400/40 transition-all duration-300 hover:scale-[1.02]"
              >
                {/* TOP */}
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {interview.applicant?.firstName}{" "}
                      {interview.applicant?.lastName}
                    </h2>

                    <p className="text-gray-400">
                      {interview.applicant?.email}
                    </p>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-full text-white text-sm font-medium ${getStatusColor(interview.status)}`}
                  >
                    {interview.status}
                  </div>
                </div>

                {/* DETAILS */}
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center space-x-2">
                    <span>📅</span>
                    <span>
                      {new Date(interview.scheduledDate).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span>🎥</span>
                    <span>{interview.interviewType}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span>👨‍💼</span>
                    <span>{interview.interviewer}</span>
                  </div>

                  {interview.meetingLink && (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-cyan-400 hover:text-cyan-300"
                    >
                      🔗 Join Meeting
                    </a>
                  )}

                  {interview.notes && (
                    <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-sm text-gray-300">{interview.notes}</p>
                    </div>
                  )}
                </div>

                {/* ADMIN ACTIONS */}
                {user?.role === "admin" && (
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() =>
                        updateInterviewStatus(interview._id, "completed")
                      }
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-medium hover:scale-105 transition-all"
                    >
                      ✅ Complete
                    </button>

                    <button
                      onClick={() =>
                        updateInterviewStatus(interview._id, "cancelled")
                      }
                      className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl text-white font-medium hover:scale-105 transition-all"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-3xl p-8 w-full max-w-2xl border border-white/20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">
                📅 Schedule Interview
              </h2>

              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-white text-3xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-5">
              <input
                type="text"
                placeholder="Applicant ID"
                required
                value={formData.applicant}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applicant: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white"
              />

              <input
                type="datetime-local"
                required
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scheduledDate: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white"
              />

              <select
                value={formData.interviewType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interviewType: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-slate-800 border border-white/20 rounded-xl text-white"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="HR Round">HR Round</option>
                <option value="Technical Round">Technical Round</option>
              </select>

              <input
                type="text"
                placeholder="Meeting Link"
                value={formData.meetingLink}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    meetingLink: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white"
              />

              <input
                type="text"
                placeholder="Interviewer Name"
                value={formData.interviewer}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interviewer: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white"
              />

              <textarea
                rows={4}
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notes: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white"
              />

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold text-lg hover:scale-[1.02] transition-all duration-300"
              >
                🚀 Schedule Interview
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
