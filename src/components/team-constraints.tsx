import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, UserX, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Player, Constraint } from "@/types";
import { generateUniqueId } from "@/lib/storage";

interface TeamConstraintsProps {
  players: Player[];
  constraints: Constraint[];
  onConstraintsChange: (constraints: Constraint[]) => void;
}

export function TeamConstraints({ players, constraints, onConstraintsChange }: TeamConstraintsProps) {
  const { t } = useTranslation();
  const [firstPlayer, setFirstPlayer] = useState("");
  const [secondPlayer, setSecondPlayer] = useState("");
  const [constraintType, setConstraintType] = useState<"together" | "separate">("together");

  const handleAddConstraint = () => {
    if (firstPlayer && secondPlayer && firstPlayer !== secondPlayer) {
      // Check if constraint already exists
      const existingConstraint = constraints.find(
        constraint =>
          (constraint.playerId1 === firstPlayer && constraint.playerId2 === secondPlayer) ||
          (constraint.playerId1 === secondPlayer && constraint.playerId2 === firstPlayer)
      );

      if (!existingConstraint) {
        const newConstraint: Constraint = {
          id: generateUniqueId(),
          playerId1: firstPlayer,
          playerId2: secondPlayer,
          type: constraintType,
        };
        
        onConstraintsChange([...constraints, newConstraint]);
      }
      
      setFirstPlayer("");
      setSecondPlayer("");
    }
  };

  const handleDeleteConstraint = (constraintId: string) => {
    const updatedConstraints = constraints.filter(constraint => constraint.id !== constraintId);
    onConstraintsChange(updatedConstraints);
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : "Unknown Player";
  };

  const getConstraintIcon = (type: "together" | "separate") => {
    return type === "together" ? <Users className="h-4 w-4" /> : <UserX className="h-4 w-4" />;
  };

  const getConstraintColor = (type: "together" | "separate") => {
    return type === "together" ? "default" : "destructive";
  };

  const availablePlayersForFirst = players.filter(player => player.id !== secondPlayer);
  const availablePlayersForSecond = players.filter(player => player.id !== firstPlayer);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t("constraints.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {players.length >= 2 ? (
          <>
            {/* Add Constraint Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("constraints.firstPlayer")}
                  </label>
                  <Select value={firstPlayer} onValueChange={setFirstPlayer}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("constraints.selectPlayer")} />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlayersForFirst.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("constraints.constraint")}
                  </label>
                  <Select value={constraintType} onValueChange={(value: "together" | "separate") => setConstraintType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="together">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {t("constraints.mustPlayTogether")}
                        </div>
                      </SelectItem>
                      <SelectItem value="separate">
                        <div className="flex items-center gap-2">
                          <UserX className="h-4 w-4" />
                          {t("constraints.cannotPlayTogether")}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("constraints.secondPlayer")}
                  </label>
                  <Select value={secondPlayer} onValueChange={setSecondPlayer}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("constraints.selectPlayer")} />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlayersForSecond.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                onClick={handleAddConstraint}
                disabled={!firstPlayer || !secondPlayer || firstPlayer === secondPlayer}
                className="w-full md:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("constraints.addConstraint")}
              </Button>
            </div>

            {/* Constraints List */}
            {constraints.length > 0 && (
              <div className="space-y-2">
                {constraints.map((constraint) => (
                  <div
                    key={constraint.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getConstraintIcon(constraint.type)}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getPlayerName(constraint.playerId1)}</span>
                        <span className="text-muted-foreground">and</span>
                        <span className="font-medium">{getPlayerName(constraint.playerId2)}</span>
                      </div>
                      <Badge variant={getConstraintColor(constraint.type)}>
                        {constraint.type === "together"
                          ? t("constraints.mustPlayTogether")
                          : t("constraints.cannotPlayTogether")}
                      </Badge>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteConstraint(constraint.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Add at least 2 players to create constraints</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
