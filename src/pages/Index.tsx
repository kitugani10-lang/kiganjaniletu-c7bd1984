import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import CreatePostDialog from '@/components/CreatePostDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BarChart3 } from 'lucide-react';

interface PostData {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author: { id: string; username: string };
  likes_count: number;
  comments_count: number;
  user_liked: boolean;
  image_urls?: string[];
  category?: string;
  views?: number;
}

const POSTS_PER_PAGE = 30;

const Index = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const [stats, setStats] = useState({ posts: 0, threads: 0 });

  const fetchPosts = useCallback(async () => {
    const { data: postsData } = await supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey(id, username)')
      .order('created_at', { ascending: false });

    if (!postsData) { setLoading(false); return; }

    let postCount = 0, threadCount = 0;
    postsData.forEach(p => { if (p.content.length <= 500) postCount++; else threadCount++; });
    setStats({ posts: postCount, threads: threadCount });

    const postIds = postsData.map(p => p.id);
    if (postIds.length > 0) {
      const visibleIds = postIds.slice(0, POSTS_PER_PAGE);
      supabase.rpc('increment_post_views', { post_ids: visibleIds }).then();
    }

    const { data: likesData } = await supabase.from('likes').select('post_id, user_id').in('post_id', postIds.length > 0 ? postIds : ['none']);
    const { data: commentsData } = await supabase.from('comments').select('post_id').in('post_id', postIds.length > 0 ? postIds : ['none']);

    const enriched: PostData[] = postsData.map((p: any) => ({
      id: p.id, title: p.title, content: p.content, created_at: p.created_at,
      author: p.author, image_urls: p.image_urls || [], category: p.category, views: p.views || 0,
      likes_count: likesData?.filter(l => l.post_id === p.id).length || 0,
      comments_count: commentsData?.filter(c => c.post_id === p.id).length || 0,
      user_liked: user ? likesData?.some(l => l.post_id === p.id && l.user_id === user.id) || false : false,
    }));

    const sorted = [...enriched].sort((a, b) => {
      const score = (eng: number, time: number) => time + eng * 3600000;
      return score(b.likes_count + b.comments_count, new Date(b.created_at).getTime())
        - score(a.likes_count + a.comments_count, new Date(a.created_at).getTime());
    });

    setPosts(sorted);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Real-time subscription for new/updated/deleted posts
  useEffect(() => {
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  useEffect(() => {
    if (posts.length > 0 && visibleCount > POSTS_PER_PAGE) {
      const newIds = posts.slice(visibleCount - POSTS_PER_PAGE, visibleCount).map(p => p.id);
      if (newIds.length > 0) supabase.rpc('increment_post_views', { post_ids: newIds }).then();
    }
  }, [visibleCount, posts]);

  const filtered = search.trim()
    ? posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase()))
    : posts;

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          {user && <CreatePostDialog onPostCreated={fetchPosts} />}
        </div>

        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-lg border p-4">
                <Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" />
              </div>
            ))
          ) : visible.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground text-lg">
                {search ? 'No posts match your search.' : 'No posts yet. Be the first to share!'}
              </p>
            </div>
          ) : (
            <>
              {visible.map((post) => <PostCard key={post.id} post={post} onUpdate={fetchPosts} />)}
              {hasMore && (
                <div className="text-center py-4">
                  <Button variant="outline" onClick={() => setVisibleCount(v => v + POSTS_PER_PAGE)}>See More</Button>
                </div>
              )}
            </>
          )}
        </div>

        <Card className="mt-8 shadow-card">
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Kanisa Kiganjani Stats</h2>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.posts.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.threads.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Threads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
