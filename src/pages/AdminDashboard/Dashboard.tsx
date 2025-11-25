import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSessions } from "../../store/session/sessionSlice";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import CreateSession from "./components/CreateSession";
import Navigation from "@/components/Navigation";

export default function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const dispatch = useAppDispatch();
  const { sessions, error, status } = useAppSelector((state) => state.sessions);
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    dispatch(fetchSessions());
  }, []);

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
  if (status === "loading") return <p className="justify-center h-screen w-screen flex items-center text-6xl text-gray-500">Loading...</p>;
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation/>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Sessions</h2>
          {isAdmin && (
            <button
              onClick={() => setShowSessionModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Create Session
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {sessions.length > 0 &&
            sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white cursor-pointer rounded-lg flex flex-col justify-between shadow-md p-6 max-w-sm min-h-64"
                onClick={() => navigate(`/dashboard/session/${session.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="">
                    <h3 className="text-3xl font-semibold text-gray-800">
                      {session.title}
                    </h3>

                    <p className="text-gray-600 text-lg mt-1">
                      {session.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">
                    Videos ({session.videos.length})
                  </h4>
                  {session.videos.length === 0 && (
                    <p className="text-gray-500 italic">No videos yet</p>
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

      <CreateSession
        showSessionModal={showSessionModal}
        setShowSessionModal={setShowSessionModal}
      />
    </div>
  );
}
