
-- Status columns for media approval
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved';
ALTER TABLE comments ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved';

-- Avatars bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
DO $$ BEGIN
  CREATE POLICY "public_avatar_read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL;
WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "auth_avatar_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "auth_avatar_update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "auth_avatar_delete" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
WHEN others THEN NULL;
END $$;

-- Storage policies for post-images
DO $$ BEGIN
  CREATE POLICY "public_post_images_read" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
EXCEPTION WHEN duplicate_object THEN NULL;
WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "auth_post_images_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
WHEN others THEN NULL;
END $$;

-- Update posts SELECT policy for approval system
DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
DROP POLICY IF EXISTS "Anyone can view approved posts" ON posts;
CREATE POLICY "Anyone can view approved posts" ON posts FOR SELECT USING (
  status = 'approved' 
  OR author_id = auth.uid()
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'moderator')
);

-- Update comments SELECT policy for approval system
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Anyone can view approved comments" ON comments;
CREATE POLICY "Anyone can view approved comments" ON comments FOR SELECT USING (
  status = 'approved'
  OR author_id = auth.uid()
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'moderator')
);
