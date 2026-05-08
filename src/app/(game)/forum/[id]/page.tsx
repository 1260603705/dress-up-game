// src/app/(game)/forum/[id]/page.tsx - 帖子详情页
import PostDetail from '@/components/forum/PostDetail';
export default function PostPage({ params }: { params: { id: string } }) {
  return (<div className="max-w-2xl mx-auto"><PostDetail postId={params.id} /></div>
  );
}
