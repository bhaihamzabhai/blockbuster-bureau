'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@/types';
import Link from 'next/link';
import { FileText, Eye, Clock, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  recentPosts: Post[];
}

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const postsRef = collection(db, 'posts');
      const allPostsSnapshot = await getDocs(postsRef);
      const allPosts = allPostsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];

      const totalPosts = allPosts.length;
      const publishedPosts = allPosts.filter((p) => p.status === 'published').length;
      const draftPosts = allPosts.filter((p) => p.status === 'draft').length;
      const totalViews = allPosts.reduce((sum, p) => sum + (p.views || 0), 0);

      const recentPosts = allPosts
        .sort((a, b) => {
          const aDate = a.updatedAt?.toDate?.() || new Date(0);
          const bDate = b.updatedAt?.toDate?.() || new Date(0);
          return bDate.getTime() - aDate.getTime();
        })
        .slice(0, 5);

      setStats({ totalPosts, publishedPosts, draftPosts, totalViews, recentPosts });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-display text-4xl text-white">Dashboard</h1>
        <p className="text-stardust mt-2">Welcome back! Here&apos;s your site overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={FileText} label="Total Posts" value={stats.totalPosts} color="gold" />
        <StatCard icon={Eye} label="Total Views" value={stats.totalViews.toLocaleString()} color="nova" />
        <StatCard icon={TrendingUp} label="Published" value={stats.publishedPosts} color="green" />
        <StatCard icon={Clock} label="Drafts" value={stats.draftPosts} color="stardust" />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <Link
          href="/dashboard/posts/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-void font-bold rounded-lg hover:scale-105 transition-transform"
        >
          Write New Post
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-nebula rounded-xl border border-white/5 p-6">
        <h2 className="text-display text-2xl text-white mb-4">Recent Activity</h2>

        {stats.recentPosts.length === 0 ? (
          <p className="text-stardust">No posts yet. Create your first post!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-stardust text-sm border-b border-white/10">
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Views</th>
                  <th className="pb-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPosts.map((post) => (
                  <tr key={post.id} className="border-b border-white/5">
                    <td className="py-3">
                      <Link
                        href={`/dashboard/posts/${post.id}/edit`}
                        className="text-white hover:text-gold transition-colors"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          post.status === 'published'
                            ? 'bg-gold/20 text-gold'
                            : 'bg-stardust/20 text-stardust'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3 text-stardust">{post.views || 0}</td>
                    <td className="py-3 text-stardust text-sm">
                      {post.updatedAt?.toDate?.().toLocaleDateString() || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: 'gold' | 'nova' | 'green' | 'stardust';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    gold: 'text-gold bg-gold/10',
    nova: 'text-nova bg-nova/10',
    green: 'text-green-400 bg-green-400/10',
    stardust: 'text-stardust bg-stardust/10',
  };

  return (
    <div className="bg-nebula rounded-xl border border-white/5 p-6">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-stardust text-sm">{label}</p>
      <p className="text-display text-3xl text-white mt-1">{value}</p>
    </div>
  );
}