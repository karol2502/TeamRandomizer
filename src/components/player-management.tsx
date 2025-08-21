import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import type { Player } from "@/types";
import { generateUniqueId } from "@/lib/storage";

interface PlayerManagementProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
}

export function PlayerManagement({ players, onPlayersChange }: PlayerManagementProps) {
  const { t } = useTranslation();
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerSkill, setNewPlayerSkill] = useState([5]);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer: Player = {
        id: generateUniqueId(),
        name: newPlayerName.trim(),
        skillLevel: newPlayerSkill[0],
      };
      
      onPlayersChange([...players, newPlayer]);
      setNewPlayerName("");
      setNewPlayerSkill([5]);
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setNewPlayerName(player.name);
    setNewPlayerSkill([player.skillLevel]);
  };

  const handleSaveEdit = () => {
    if (editingPlayer && newPlayerName.trim()) {
      const updatedPlayers = players.map(player =>
        player.id === editingPlayer.id
          ? { ...player, name: newPlayerName.trim(), skillLevel: newPlayerSkill[0] }
          : player
      );
      
      onPlayersChange(updatedPlayers);
      setEditingPlayer(null);
      setNewPlayerName("");
      setNewPlayerSkill([5]);
    }
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
    setNewPlayerName("");
    setNewPlayerSkill([5]);
  };

  const handleDeletePlayer = (playerId: string) => {
    const updatedPlayers = players.filter(player => player.id !== playerId);
    onPlayersChange(updatedPlayers);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editingPlayer) {
        handleSaveEdit();
      } else {
        handleAddPlayer();
      }
    }
    if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const totalSkillPoints = players.reduce((sum, player) => sum + player.skillLevel, 0);
  const averageSkillPerTeam = players.length > 0 ? (totalSkillPoints / 2).toFixed(1) : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {t("playerManagement.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add/Edit Player Form */}
        <div className="flex items-center gap-4 justify-between">
          <div className="space-y-2">
            <Label htmlFor="playerName">{t("playerManagement.playerName")}</Label>
            <Input
              id="playerName"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder={t("playerManagement.playerName")}
              onKeyDown={handleKeyPress}
            />
          </div>
          
          <div className="space-y-4 grow">
            <Label htmlFor="skillLevel" className="px-2">
              {t("playerManagement.skillLevel", { min: 0, max: 10 })}
            </Label>
            <div className="px-3">
              <Slider
                id="skillLevel"
                min={0}
                max={10}
                step={1}
                value={newPlayerSkill}
                onValueChange={setNewPlayerSkill}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>0</span>
                <span className="font-medium">{newPlayerSkill[0]}</span>
                <span>10</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {editingPlayer ? (
              <>
                <Button onClick={handleSaveEdit} disabled={!newPlayerName.trim()}>
                  {t("common.save")}
                </Button>
                <Button variant="outline" onClick={handleCancelEdit}>
                  {t("common.cancel")}
                </Button>
              </>
            ) : (
              <Button onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
                {t("playerManagement.addPlayer")}
              </Button>
            )}
          </div>
        </div>

        {/* Players List */}
        {players.length > 0 && (
          <div className="space-y-3">
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{player.name}</div>
                    <Badge variant="secondary">
                      {t("playerManagement.skillLevel")}: {player.skillLevel}/10
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPlayer(player)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePlayer(player.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Statistics */}
            <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t">
              <div>{t("playerManagement.totalPlayers", { count: players.length })}</div>
              <div>{t("playerManagement.totalSkillPoints", { points: totalSkillPoints })}</div>
              <div>{t("playerManagement.averageSkillPerTeam", { average: averageSkillPerTeam })}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
