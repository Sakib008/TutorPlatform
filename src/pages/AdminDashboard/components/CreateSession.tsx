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
import { sessionSchema } from "../../../lib/formSchema";
import { useAppDispatch, useAppSelector } from "../../../store/hook";
import {
  createSession,
  fetchSessions,
} from "../../../store/session/sessionSlice";
import { toast } from "sonner";

interface CreateSessionProps {
  showSessionModal: boolean;
  setShowSessionModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateSession = ({
  showSessionModal,
  setShowSessionModal,
}: CreateSessionProps) => {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.sessions);
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "ADMIN";

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const handleCreateSession = async (data: z.infer<typeof sessionSchema>) => {
    try {
      if (!isAdmin) {
        toast.error("Only admins can create sessions.");
        return;
      }
      await dispatch(createSession({...data, description: data.description ?? null}));
      await dispatch(fetchSessions());
      form.reset();
      toast.success("Session created successfully");
      setShowSessionModal(false);
    } catch (err) {
      toast.error(
        "Failed to create session: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  if (!showSessionModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create Session</h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateSession)}
            className="space-y-4"
          >
            {/* Title Field */}
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
                      placeholder="Enter session title"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
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
                      placeholder="Enter session description"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {status === "loading" ? "Creating..." : "Create"}
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
        </Form>
      </div>
    </div>
  );
};

export default CreateSession;
