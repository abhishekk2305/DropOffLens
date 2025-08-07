import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Settings, Crown, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { apiRequest } from "@/lib/queryClient";
import type { Team, TeamWithMembers } from "@/lib/types";

export default function TeamManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["/api/user/teams"],
    enabled: !!user,
  }) as { data: Team[], isLoading: boolean };

  const createTeamMutation = useMutation({
    mutationFn: async (teamData: { name: string; description?: string }) => {
      const response = await apiRequest("POST", "/api/teams", teamData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/teams"] });
      setIsCreateDialogOpen(false);
      setNewTeamName("");
      setNewTeamDescription("");
      toast({
        title: "Team created",
        description: "Your team has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create team",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;
    createTeamMutation.mutate({
      name: newTeamName,
      description: newTeamDescription || undefined,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to manage teams</h1>
            <Button onClick={() => window.location.href = '/api/login'}>
              Log In
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Users className="mr-3 text-blue-600" size={32} />
                Team Management
              </h1>
              <p className="text-gray-600">
                Create and manage teams for collaborative analysis
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2" size={16} />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input
                      id="team-name"
                      placeholder="Enter team name"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-description">Description (Optional)</Label>
                    <Textarea
                      id="team-description"
                      placeholder="Describe your team's purpose"
                      value={newTeamDescription}
                      onChange={(e) => setNewTeamDescription(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleCreateTeam}
                    disabled={!newTeamName.trim() || createTeamMutation.isPending}
                    className="w-full"
                  >
                    {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Teams List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first team to start collaborating on feedback analysis
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2" size={16} />
                Create Your First Team
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} currentUser={user} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

interface TeamCardProps {
  team: Team;
  currentUser: any;
}

function TeamCard({ team, currentUser }: TeamCardProps) {
  const { data: teamDetails } = useQuery({
    queryKey: [`/api/teams/${team.id}`],
  }) as { data: TeamWithMembers | undefined };

  const isOwner = team.ownerId === currentUser.id;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{team.name}</span>
          {isOwner && <Crown className="w-4 h-4 text-yellow-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {team.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {team.description}
          </p>
        )}
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Members</span>
            <Badge variant="secondary">
              {teamDetails?.members.length || 0}
            </Badge>
          </div>
          
          {teamDetails?.members && (
            <div className="flex -space-x-2 overflow-hidden">
              {teamDetails.members.slice(0, 5).map((member) => (
                <Avatar key={member.id} className="w-8 h-8 border-2 border-white">
                  <AvatarImage src={member.user.profileImageUrl} />
                  <AvatarFallback className="text-xs">
                    {member.user.firstName?.[0] || member.user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {teamDetails.members.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-gray-600">
                    +{teamDetails.members.length - 5}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1">
            <Settings className="w-4 h-4 mr-1" />
            {isOwner ? "Manage" : "View"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}