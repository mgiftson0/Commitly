"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Target, ArrowLeft, Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { supabase } from "@/lib/supabase-client";

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock users for demonstration
  const mockUsers: User[] = [
    {
      id: "1",
      name: "Alex Chen",
      username: "alex_chen",
      bio: "Fitness enthusiast and productivity coach",
    },
    {
      id: "2",
      name: "Sarah Martinez",
      username: "sarah_m",
      bio: "Marathon runner and wellness advocate",
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      username: "emily_r",
      bio: "Software engineer focused on healthy habits",
    },
    {
      id: "4",
      name: "John Doe",
      username: "john_d",
      bio: "Goal achievement specialist",
    },
    {
      id: "5",
      name: "Jane Smith",
      username: "jane_s",
      bio: "Mindfulness and meditation practitioner",
    },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);

    try {
      const lowerQuery = searchQuery.toLowerCase();
      
      // Search users from database
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, profile_picture_url, bio')
        .or(`username.ilike.%${lowerQuery}%,first_name.ilike.%${lowerQuery}%,last_name.ilike.%${lowerQuery}%,bio.ilike.%${lowerQuery}%`)
        .limit(20);

      if (error) {
        console.error('Search error:', error);
        toast.error('Failed to search users');
        setSearchResults([]);
      } else {
        const mappedUsers: User[] = (users || []).map(user => ({
          id: user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'User',
          username: user.username || 'no-username',
          avatar: user.profile_picture_url || undefined,
          bio: user.bio || undefined
        }));
        
        setSearchResults(mappedUsers);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('An error occurred while searching');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const sendPartnerRequest = async (userId: string) => {
    try {
      // In a real app, this would send a request to the backend
      toast.success("Partner request sent!");
    } catch (error) {
      toast.error("Failed to send partner request");
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover-lift">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Find Partners</h1>
            <p className="text-muted-foreground">
              Discover accountability partners to support your goals
            </p>
          </div>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Users
            </CardTitle>
            <CardDescription>
              Find potential accountability partners by name, username, or
              interests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                placeholder="Search by name, username, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading} className="hover-lift">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </div>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results ({searchResults.length})</CardTitle>
              <CardDescription>
                Connect with these users to become accountability partners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        @{user.username}
                      </div>
                      {user.bio && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {user.bio}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => sendPartnerRequest(user.id)}
                    size="sm"
                    className="hover-lift"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send Request
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {searchQuery && searchResults.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">
                Try searching with different keywords or check your spelling
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Initial State */}
        {!searchQuery && searchResults.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Find Your Accountability Partners
              </h3>
              <p className="text-muted-foreground mb-4">
                Use the search above to discover users who share similar goals
                and interests
              </p>
              <div className="text-sm text-muted-foreground">
                <p>Tips for finding great partners:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Search for users with similar fitness goals</li>
                  <li>• Look for people with complementary skills</li>
                  <li>• Connect with users in your area or timezone</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
