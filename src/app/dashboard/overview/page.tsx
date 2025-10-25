// src/app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Calendar, TrendingUp, Sparkles, Image as ImageIcon, Mic, 
  Twitter, Facebook, Linkedin, Clock, MoreHorizontal, Zap,
  Link as LinkIcon, BarChart3, Users, CheckCircle, AlertTriangle,
  Eye, Heart, MessageCircle, Share2, ArrowUpRight, Send, X,
  InstagramIcon,
  YoutubeIcon,
  ZapIcon
} from 'lucide-react';
import { usePosts } from '@/hooks/api/use-posts';
import { useSocialConnections } from '@/hooks/api/use-social-connections';
import { format } from 'date-fns';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';
import CreatePostModal from '@/components/modals/create-post-modal';

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { data: posts, isLoading: postsLoading } = usePosts({ limit: 6 });
  const { connections, isLoading: connectionsLoading } = useSocialConnections();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [aiEnhanced, setAiEnhanced] = useState(false);

  const connectedPlatforms = connections?.map((c: any) => c.platform.toLowerCase()) || [];

  const platforms = [
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'bg-black', limit: 280 },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600', limit: 63206 },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', limit: 3000 },
    { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: 'bg-pink-500', limit: 2200 },
    {id:'tiktok', name:'TikTok', icon:ZapIcon, color:'bg-black', limit:150  },
    {id:'youtube', name:'YouTube', icon:YoutubeIcon, color:'bg-red-600', limit:5000  }
  ];

  const quickStats = [
    { label: 'Total Posts', value: user?.posts_used || 0, icon: BarChart3, color: 'text-blue-600' },
    { label: 'Scheduled', value: posts?.filter((p: any) => p.status === 'scheduled').length || 0, icon: Clock, color: 'text-purple-600' },
    { label: 'Connected', value: connections?.length || 0, icon: LinkIcon, color: 'text-green-600' },
    { label: 'Success Rate', value: '94%', icon: TrendingUp, color: 'text-orange-600' }
  ];

  const handleEnhanceContent = async () => {
    setIsEnhancing(true);
    // Simulate AI enhancement
    setTimeout(() => {
      setAiEnhanced(true);
      setIsEnhancing(false);
    }, 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedImages([...uploadedImages, ...Array.from(e.target.files)]);
    }
  };

  const togglePlatform = (platformId: string) => {
    if (!connectedPlatforms.includes(platformId)) return;
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your social presence</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Post
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={cn("p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100", stat.color)}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Recent Posts */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Connected Accounts */}
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Connected Accounts</CardTitle>
                    <CardDescription>Connect your social media platforms</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/social">Manage</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {platforms.map((platform) => {
                    const isConnected = connectedPlatforms.includes(platform.id);
                    const PlatformIcon = platform.icon;
                    
                    return (
                      <button
                        key={platform.id}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-left",
                          isConnected 
                            ? "border-green-500 bg-green-50 hover:bg-green-100" 
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg text-white", platform.color)}>
                            <PlatformIcon className="size-6" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{platform.name}</p>
                            <p className="text-xs text-gray-600">
                              {isConnected ? 'Connected' : 'Not connected'}
                            </p>
                          </div>
                          {isConnected && (
                            <CheckCircle className="size-6 text-green-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Posts</CardTitle>
                    <CardDescription>Your latest scheduled and published posts</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/posts">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : posts && posts.length > 0 ? (
                  <div className="space-y-3">
                    {posts.slice(0, 6).map((post: any) => (
                      <div 
                        key={post.id}
                        className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all bg-white"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                              {post.original_content}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                {post.platforms?.map((p: string) => {
                                  const platform = platforms.find(pl => pl.id === p.toLowerCase());
                                  if (!platform) return null;
                                  const Icon = platform.icon;
                                  return <Icon key={p} className="h-3 w-3" />;
                                })}
                              </div>
                              {post.scheduled_for && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(post.scheduled_for), 'MMM d, h:mm a')}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge 
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              post.status === 'posted' && "bg-green-100 text-green-800",
                              post.status === 'scheduled' && "bg-blue-100 text-blue-800",
                              post.status === 'failed' && "bg-red-100 text-red-800"
                            )}
                          >
                            {post.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-gray-600 mb-4">Create your first post to get started</p>
                    <Button onClick={() => setShowCreateModal(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Post
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Engagement & Quick Actions */}
          <div className="space-y-6">
            
            {/* Engagement Overview */}
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle>Engagement</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Eye, label: 'Views', value: '12.5K', change: '+12%' },
                  { icon: Heart, label: 'Likes', value: '8.7K', change: '+18%' },
                  { icon: MessageCircle, label: 'Comments', value: '1.2K', change: '+7%' },
                  { icon: Share2, label: 'Shares', value: '856', change: '+22%' }
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                        <metric.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">{metric.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{metric.value}</p>
                      <p className="text-xs text-green-600">{metric.change}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/calendar">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Calendar
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/analytics">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/templates">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Templates
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Post Modal */}
        <CreatePostModal 
            selectedPlatforms={selectedPlatforms}
            postContent={postContent}
            setPostContent={setPostContent}
            showCreateModal={showCreateModal}
            setShowCreateModal={setShowCreateModal}
            setScheduledDate={setScheduledDate}
            scheduledDate={scheduledDate}
            platforms={platforms}
            uploadedImages={uploadedImages}
            setUploadedImages={setUploadedImages}
            handleImageUpload={handleImageUpload}
            togglePlatform={togglePlatform}
            aiEnhanced={aiEnhanced}
            isEnhancing={isEnhancing}
            handleEnhanceContent={handleEnhanceContent}
            connectedPlatforms={connectedPlatforms}
        />
      </div>
    </div>
  );
}