-- WARNING: Security hardening to stop anonymous exposure of user-linked content.
-- This removes public read access that allowed unauthenticated users to see rows containing author/user identifiers.

-- POSTS: remove anonymous/public read policy
DROP POLICY IF EXISTS "Anyone can view approved posts" ON public.posts;

-- POSTS: authenticated read only (approved posts, own posts, moderators/admins)
CREATE POLICY "Authenticated can view approved posts"
ON public.posts
FOR SELECT
TO authenticated
USING (
  status = 'approved'
  OR author_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
);

-- COMMENTS: remove anonymous/public read policy
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.comments;

-- COMMENTS: authenticated read only (approved comments, own comments, moderators/admins)
CREATE POLICY "Authenticated can view approved comments"
ON public.comments
FOR SELECT
TO authenticated
USING (
  status = 'approved'
  OR author_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
);