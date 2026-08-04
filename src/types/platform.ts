export type Creator = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  verified: boolean;
  created_at: string;
}

export type Project = {
  id: string;
  creator_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  tags: string[];
  visibility: 'public' | 'unlisted' | 'private';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  latest_commit_id: string | null;
  commit_count: number;
  last_committed_at: string | null;
}

export type Commit = {
  id: string;
  project_id: string;
  creator_id: string;
  message: string;
  snapshot_url: string | null;
  metadata: {
    operation_count?: number;
    duration_secs?: number;
    [key: string]: unknown;
  };
  created_at: string;
}
