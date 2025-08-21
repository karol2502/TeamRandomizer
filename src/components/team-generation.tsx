import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Shuffle, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Player, Constraint, Team } from "@/types";
import { generateTeamsWithConstraints } from "@/lib/team-generator";

interface TeamGenerationProps {
  players: Player[];
  constraints: Constraint[];
  teams: Team[];
  numberOfTeams: number;
  onTeamsChange: (teams: Team[]) => void;
  onNumberOfTeamsChange: (numberOfTeams: number) => void;
}

export function TeamGeneration({
  players,
  constraints,
  teams,
  numberOfTeams,
  onTeamsChange,
  onNumberOfTeamsChange,
}: TeamGenerationProps) {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTeams = async () => {
    if (players.length < 2) return;

    setIsGenerating(true);
    
    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const generatedTeams = generateTeamsWithConstraints({
      players,
      constraints,
      numberOfTeams,
    });
    
    onTeamsChange(generatedTeams);
    setIsGenerating(false);
  };

  const getTeamColor = (index: number) => {
    const colors = [
      "bg-blue-100 border-blue-300 dark:bg-blue-950 dark:border-blue-800",
      "bg-red-100 border-red-300 dark:bg-red-950 dark:border-red-800",
      "bg-green-100 border-green-300 dark:bg-green-950 dark:border-green-800",
      "bg-yellow-100 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-800",
      "bg-purple-100 border-purple-300 dark:bg-purple-950 dark:border-purple-800",
      "bg-pink-100 border-pink-300 dark:bg-pink-950 dark:border-pink-800",
    ];
    return colors[index % colors.length];
  };

  const getTeamBadgeColor = (index: number): "default" | "secondary" | "destructive" | "outline" => {
    const badgeColors: Array<"default" | "secondary" | "destructive" | "outline"> = [
      "default",
      "destructive", 
      "secondary",
      "outline",
    ];
    return badgeColors[index % badgeColors.length];
  };

  const skillDifference = teams.length >= 2 ? 
    Math.max(...teams.map(t => t.totalSkill)) - Math.min(...teams.map(t => t.totalSkill)) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shuffle className="h-5 w-5" />
          {t("teamGeneration.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Generation Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">
              {t("teamGeneration.numberOfTeams")}
            </label>
            <Select
              value={numberOfTeams.toString()}
              onValueChange={(value) => onNumberOfTeamsChange(parseInt(value, 10))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {t("teamGeneration.numberOfTeams").toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={handleGenerateTeams}
              disabled={players.length < 2 || isGenerating}
              className="w-full sm:w-auto"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              {isGenerating ? t("common.loading") : t("teamGeneration.generateTeams")}
            </Button>
          </div>
        </div>

        {players.length < 2 && (
          <div className="text-center text-muted-foreground py-8">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Add at least 2 players to generate teams</p>
          </div>
        )}

        {/* Generated Teams */}
        {teams.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("teamGeneration.generatedTeams")}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {teams.map((team, index) => (
                <div
                  key={team.id}
                  className={`p-4 rounded-lg border-2 ${getTeamColor(index)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg">{team.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={getTeamBadgeColor(index)}>
                        {team.players.length} {team.players.length === 1 ? 'player' : 'players'}
                      </Badge>
                      <Badge variant="outline">
                        {t("teamGeneration.skillPoints", { points: team.totalSkill })}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {team.players.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 bg-white/50 dark:bg-black/20 rounded"
                      >
                        <span className="font-medium">{player.name}</span>
                        <Badge variant="secondary">
                          {player.skillLevel}/10
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Team Balance Information */}
            <div className="mt-6">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5" />
                {t("teamGeneration.teamBalance")}
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {teams.map((team) => (
                  <div key={team.id} className="text-center">
                    <div className="font-medium">{team.name}</div>
                    <div className="text-muted-foreground">
                      {t("teamGeneration.skillPoints", { points: team.totalSkill })}
                    </div>
                  </div>
                ))}
                <div className="text-center">
                  <div className="font-medium">Skill Difference</div>
                  <div className="text-muted-foreground">
                    {skillDifference} points
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
