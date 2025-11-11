export interface Video {
  id: string;
  title: string;
  description?: string;
  sessionId: string;
  file: File | null;
  duration?: number;
}

export interface Session {
  id: string;
  title: string;
  description?: string;
  videos: Video[];
}


export type CreateVideoInput = Omit<Video, "id">;
