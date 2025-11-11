import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchSessions,
  createSession,
  deleteSession,
  createVideo,
  deleteVideo,
} from "../store/session/sessionSlice";
import { useAppDispatch, useAppSelector } from "../store/hook";
import type { Session } from "../store/types";
import { logout } from "../store/session/authSlice";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  type VideoFormType = {
    title: string;
    description: string;
    file: File | null;
    sessionId: string;
    duration: number;
  };

  const [sessionForm, setSessionForm] = useState({
    title: "",
    description: "",
  });
  const [videoForm, setVideoForm] = useState<VideoFormType>({
    title: "",
    description: "",
    file: null,
    sessionId: selectedSession ? selectedSession.id : "",
    duration: Number(""),
  });
  const dispatch = useAppDispatch();
  const { sessions, error, status } = useAppSelector((state) => state.sessions);
  console.log("Sessions in Admin Dashboard : ", sessions);
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    dispatch(fetchSessions());
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(createSession(sessionForm));
      dispatch(fetchSessions());
      console.log("Session created");
      setSessionForm({ title: "", description: "" });
    } catch (err: any) {
      console.error("Failed to create session", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if(!videoForm.file){
          toast.error("Please select a video file.");
          setLoading(false);
          return;
      }
      await dispatch(
        createVideo({
          ...videoForm,
          sessionId: selectedSession?.id || "",
        })
      );
      dispatch(fetchSessions());
      setVideoForm({
        title: "",
        description: "",
        sessionId: "",
        file: null,
        duration: Number(""),
      });
    } catch (err: any) {
      console.error("Failed to create video", err);
    } finally {
      setLoading(false);
    }
  };
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center min-w-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Error
          </h1>
          <p className="text-center text-gray-600 mt-4">{error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.name}</span>
            <button
              onClick={() => dispatch(logout())}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Sessions</h2>
          <button
            onClick={() => setShowSessionModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Create Session
          </button>
        </div>

        <div className="grid gap-6">
          {status === "loading" || loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : null}
          {sessions &&
            sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800">
                      {session.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{session.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedSession(session);
                        setShowVideoModal(true);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      + Add Video
                    </button>
                    <button
                      onClick={() => dispatch(deleteSession(session.id))}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">
                    Videos ({session.videos.length})
                  </h4>
                  {session.videos.length === 0 ? (
                    <p className="text-gray-500 italic">No videos yet</p>
                  ) : (
                    session.videos.map((video) => (
                      <div
                        key={video.id}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {video.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {video.description}
                          </p>
                        </div>
                        <button
                          onClick={() => dispatch(deleteVideo(video.id))}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}

          {status === "failed" && (
            <p className="text-center text-gray-500 py-12">
              {error || "Failed to load sessions."}
            </p>
          )}
          {status === "succeeded" && sessions.length === 0 && (
            <p className="text-center text-gray-500 py-12">
              No sessions yet. Create your first session!
            </p>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create Session</h2>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={sessionForm.title}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={sessionForm.description}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Video</h2>
            <form onSubmit={handleCreateVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={videoForm.title}
                  onChange={(e) =>
                    setVideoForm({ ...videoForm, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    setVideoForm({
                      ...videoForm,
                      file:
                        e.target.files?.[0] != null ? e.target.files[0] : null,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={videoForm.description}
                  onChange={(e) =>
                    setVideoForm({ ...videoForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
             
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Video"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
