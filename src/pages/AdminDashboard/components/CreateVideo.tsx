import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { videoSchema } from "../../../lib/formSchema";
import { useAppDispatch, useAppSelector } from "../../../store/hook";
import { createVideo, fetchSessionById, fetchSessions } from "../../../store/session/sessionSlice";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

interface VideoModelProps {
  showVideoModel: boolean;
  setShowVideoModel: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateVideo = ({ showVideoModel, setShowVideoModel }: VideoModelProps) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.sessions);
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "ADMIN";

  const form = useForm<z.infer<typeof videoSchema>>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: "",
      description: "",
      file: undefined,
      sessionId: sessionId ?? "",
    },
  });
  const handleClose = () => {
    setShowVideoModel(false);
    form.reset();
  };

  const handleCreateVideo = async (data: z.infer<typeof videoSchema>) => {
    try {
      if (!isAdmin) {
        toast.error("Only admins can add videos.");
        return;
      }

      await dispatch(createVideo(data));
      dispatch(fetchSessionById(sessionId));
      form.reset();
      setShowVideoModel(false);
    } catch (err) {
      toast.error(
        "Failed to add video: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  if (!showVideoModel) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add Video</h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateVideo)}
            className="space-y-4"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter video title"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="Enter video description"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File */}
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, name,ref } }) => (
                <FormItem>
                  <FormLabel>Video File</FormLabel>
                  <FormControl>
                    <input
                      type="file"
                      accept="video/*"
                      name={name}
                      ref={ref}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if(!file) return toast.error("Please select a video file.");
                      onChange(file);
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {status === "loading" ? "Adding..." : "Add Video"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateVideo;
