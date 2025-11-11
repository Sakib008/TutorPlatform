import { useState, useEffect } from 'react';
import api from '../lib/api';
import VideoPlayer from '../components/VideoPlayer';
import { useAppDispatch, useAppSelector } from '../store/hook';
import { logout } from '../store/session/authSlice';

interface Session {
  id: string;
  title: string;
  description: string;
  videos: Video[];
}

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  duration?: number;
}

export default function StudentDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions');
      setSessions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">TutorWeb</h1>
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
        {selectedVideo ? (
          <div>
            <button
              onClick={() => setSelectedVideo(null)}
              className="mb-4 text-blue-600 hover:underline flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Sessions
            </button>

            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedVideo.title}
              </h2>
              {selectedVideo.description && (
                <p className="text-gray-600 mb-4">{selectedVideo.description}</p>
              )}
              {selectedSession && (
                <p className="text-sm text-gray-500 mb-4">
                  Session: {selectedSession.title}
                </p>
              )}
            </div>

            <VideoPlayer url={selectedVideo.url} title={selectedVideo.title} />

            {/* Other videos in the session */}
            {selectedSession && selectedSession.videos.length > 1 && (
              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  More videos in this session
                </h3>
                <div className="space-y-2">
                  {selectedSession.videos
                    .filter((v) => v.id !== selectedVideo.id)
                    .map((video) => (
                      <button
                        key={video.id}
                        onClick={() => setSelectedVideo(video)}
                        className="w-full text-left bg-gray-50 hover:bg-gray-100 p-3 rounded transition"
                      >
                        <p className="font-medium text-gray-800">{video.title}</p>
                        <p className="text-sm text-gray-600">{video.description}</p>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Available Sessions
            </h2>

            {sessions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">
                  No sessions available yet. Check back later!
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {sessions.map((session) => (
                  <div key={session.id} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                      {session.title}
                    </h3>
                    {session.description && (
                      <p className="text-gray-600 mb-4">{session.description}</p>
                    )}

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Videos ({session.videos.length})
                      </h4>
                      {session.videos.length === 0 ? (
                        <p className="text-gray-500 italic">No videos in this session yet</p>
                      ) : (
                        <div className="grid gap-2">
                          {session.videos.map((video) => (
                            <button
                              key={video.id}
                              onClick={() => {
                                setSelectedVideo(video);
                                setSelectedSession(session);
                              }}
                              className="text-left bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition group"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800 group-hover:text-blue-600 transition">
                                    {video.title}
                                  </p>
                                  {video.description && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {video.description}
                                    </p>
                                  )}
                                </div>
                                <svg
                                  className="w-8 h-8 text-blue-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                </svg>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

