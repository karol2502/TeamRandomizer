export interface Player {
  id: string;
  name: string;
  skillLevel: number;
}

export interface Constraint {
  id: string;
  playerId1: string;
  playerId2: string;
  type: 'together' | 'separate';
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  totalSkill: number;
}

export interface AppState {
  players: Player[];
  constraints: Constraint[];
  teams: Team[];
  numberOfTeams: number;
}

export interface ShareableData {
  players: Player[];
  constraints: Constraint[];
  teams: Team[];
  numberOfTeams: number;
  timestamp: number;
}
