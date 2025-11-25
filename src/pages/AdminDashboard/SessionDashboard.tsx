import { useEffect, useState } from "react";
import { MoveLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchSessionById } from "@/store/session/sessionSlice";
import VideoPlayer from "../../components/VideoPlayer";
import CreateVideo from "./components/CreateVideo";
import Navigation from "@/components/Navigation";

const SessionDashboard = () => {
  const sessionId = useParams().sessionId;
  const dispatch = useAppDispatch();
  const { session, status } = useAppSelector((state) => state.sessions);
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "ADMIN";
  const navigate = useNavigate();

  const [showVideoModel, setShowVideoModel] = useState(false);

  useEffect(() => {
    dispatch(fetchSessionById(sessionId));
  }, []);
  if (status === "failed")
    return <p className="text-center text-gray-500">Loading...</p>;
  if (status === "succeeded" && !session) return <div>Session not found</div>;
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation/>
      <div className=" max-w-7xl mx-auto p-6">
        <div
          onClick={() => navigate(-1)}
          className=" mb-2 font-semibold text-gray-800 flex gap-2 cursor-pointer items-center"
        >
          <MoveLeft className="size-7" />
          <span className="text-lg"> Back to Dashboard</span>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">{session?.title}</h2>
          {isAdmin && (
            <button
              onClick={() => setShowVideoModel(true)}
              className="bg-violet-600 cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition"
            >
              + Create Video
            </button>
          )}
        </div>
        <div className="flex gap-6 flex-wrap">
          {(session?.videos.length as number) > 0 &&
            session.videos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-lg shadow-md p-6 max-w-sm"
              >
                <VideoPlayer url={video.url} title={video.title} />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {video.title}
                </h3>
              </div>
            ))}
        </div>
      </div>
      <CreateVideo
        showVideoModel={showVideoModel}
        setShowVideoModel={setShowVideoModel}
      />
    </div>
  );
};

export default SessionDashboard;
