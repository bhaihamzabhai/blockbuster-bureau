import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@/types';
import PostEditor from '@/components/admin/PostEditor';
import { notFound } from 'next/navigation';

interface EditPostPageProps {
  params: { id: string };
}

async function getPost(id: string): Promise<Post | null> {
  try {
    const docRef = doc(db, 'posts', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as Post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  return <PostEditor initialData={post} postId={params.id} />;
}