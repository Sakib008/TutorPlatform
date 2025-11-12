export interface Video {
  id: string;
  title: string;
  description?: string;
  sessionId: string;
  file: File | null;
  url?: string;
  duration?: number;
}

export interface Session {
  id: string;
  title: string;
  description?: string | null;
  videos: Video[];
}

export type CreateVideoInput = Omit<Video, "id">;
