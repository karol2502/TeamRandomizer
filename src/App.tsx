import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { PlayerManagement } from "@/components/player-management";
import { TeamConstraints } from "@/components/team-constraints";
import { TeamGeneration } from "@/components/team-generation";
import { ShareExport } from "@/components/share-export";
import type { AppState, Player, Constraint, Team } from "@/types";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  parseShareableLink,
} from "@/lib/storage";

function App() {
  const { t } = useTranslation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [numberOfTeams, setNumberOfTeams] = useState(2);

  // Load data on app start
  useEffect(() => {
    // First, try to load from URL (shared link)
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = parseShareableLink(urlParams);

    if (sharedData) {
      setPlayers(sharedData.players);
      setConstraints(sharedData.constraints);
      setTeams(sharedData.teams);
      setNumberOfTeams(sharedData.numberOfTeams);

      saveToLocalStorage({
        ...sharedData,
      });

      // Clean URL after loading shared data
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Load from localStorage if no shared data
      const savedData = loadFromLocalStorage();
      if (savedData) {
        setPlayers(savedData.players);
        setConstraints(savedData.constraints);
        setTeams(savedData.teams);
        setNumberOfTeams(savedData.numberOfTeams);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (players.length === 0) {
      return;
    }

    const appState: AppState = {
      players,
      constraints,
      teams,
      numberOfTeams,
    };

    saveToLocalStorage(appState);
  }, [players, constraints, teams, numberOfTeams]);

  const handlePlayersChange = (newPlayers: Player[]) => {
    setPlayers(newPlayers);

    // Remove constraints that reference deleted players
    const playerIds = new Set(newPlayers.map((p) => p.id));
    const validConstraints = constraints.filter(
      (c) => playerIds.has(c.playerId1) && playerIds.has(c.playerId2)
    );

    if (validConstraints.length !== constraints.length) {
      setConstraints(validConstraints);
    }
  };

  const handleImportData = (importedData: AppState) => {
    setPlayers(importedData.players);
    setConstraints(importedData.constraints);
    setTeams(importedData.teams);
    setNumberOfTeams(importedData.numberOfTeams);
  };

  const currentAppState: AppState = {
    players,
    constraints,
    teams,
    numberOfTeams,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t("title")}</h1>
              <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 grow">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <PlayerManagement
              players={players}
              onPlayersChange={handlePlayersChange}
            />

            <TeamConstraints
              players={players}
              constraints={constraints}
              onConstraintsChange={setConstraints}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <TeamGeneration
              players={players}
              constraints={constraints}
              teams={teams}
              numberOfTeams={numberOfTeams}
              onTeamsChange={setTeams}
              onNumberOfTeamsChange={setNumberOfTeams}
            />

            <ShareExport
              appState={currentAppState}
              onImportData={handleImportData}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Team Randomizer - Built with React, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
