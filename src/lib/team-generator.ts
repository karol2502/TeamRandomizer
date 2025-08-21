import type { Player, Constraint, Team } from "@/types";

interface TeamGenerationOptions {
  players: Player[];
  constraints: Constraint[];
  numberOfTeams: number;
}

interface TeamCandidate {
  teams: Team[];
  skillVariance: number;
  constraintViolations: number;
}

export function generateBalancedTeams({
  players,
  constraints,
  numberOfTeams,
}: TeamGenerationOptions): Team[] {
  if (players.length === 0) return [];
  if (numberOfTeams < 2) return [];

  const maxAttempts = 1000;
  let bestCandidate: TeamCandidate | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateRandomTeams(players, numberOfTeams);
    const evaluation = evaluateTeams(candidate, constraints);
    
    if (
      !bestCandidate ||
      evaluation.constraintViolations < bestCandidate.constraintViolations ||
      (evaluation.constraintViolations === bestCandidate.constraintViolations &&
        evaluation.skillVariance < bestCandidate.skillVariance)
    ) {
      bestCandidate = evaluation;
    }

    // If we found a perfect solution, stop early
    if (evaluation.constraintViolations === 0 && evaluation.skillVariance < 1) {
      break;
    }
  }

  return bestCandidate?.teams || [];
}

function generateRandomTeams(players: Player[], numberOfTeams: number): Team[] {
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
  const teams: Team[] = [];

  // Initialize teams
  for (let i = 0; i < numberOfTeams; i++) {
    teams.push({
      id: `team-${i}`,
      name: `Team ${String.fromCharCode(65 + i)}`, // Team A, Team B, etc.
      players: [],
      totalSkill: 0,
    });
  }

  // Distribute players round-robin style
  shuffledPlayers.forEach((player, index) => {
    const teamIndex = index % numberOfTeams;
    teams[teamIndex].players.push(player);
    teams[teamIndex].totalSkill += player.skillLevel;
  });

  return teams;
}

function evaluateTeams(teams: Team[], constraints: Constraint[]): TeamCandidate {
  // Calculate skill variance
  const skillLevels = teams.map(team => team.totalSkill);
  const averageSkill = skillLevels.reduce((sum, skill) => sum + skill, 0) / skillLevels.length;
  const skillVariance = skillLevels.reduce((sum, skill) => sum + Math.pow(skill - averageSkill, 2), 0) / skillLevels.length;

  // Count constraint violations
  let constraintViolations = 0;

  for (const constraint of constraints) {
    const player1Teams = teams.filter(team => team.players.some(p => p.id === constraint.playerId1));
    const player2Teams = teams.filter(team => team.players.some(p => p.id === constraint.playerId2));

    if (player1Teams.length === 0 || player2Teams.length === 0) continue;

    const sameTeam = player1Teams.some(team => player2Teams.some(otherTeam => team.id === otherTeam.id));

    if (constraint.type === 'together' && !sameTeam) {
      constraintViolations++;
    } else if (constraint.type === 'separate' && sameTeam) {
      constraintViolations++;
    }
  }

  return {
    teams,
    skillVariance,
    constraintViolations,
  };
}

export function generateTeamsWithConstraints({
  players,
  constraints,
  numberOfTeams,
}: TeamGenerationOptions): Team[] {
  if (players.length === 0) return [];
  if (numberOfTeams < 2) return [];

  // Enhanced algorithm that considers constraints during generation
  const maxAttempts = 2000;
  let bestCandidate: TeamCandidate | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateConstraintAwareTeams(players, constraints, numberOfTeams);
    const evaluation = evaluateTeams(candidate, constraints);
    
    if (
      !bestCandidate ||
      evaluation.constraintViolations < bestCandidate.constraintViolations ||
      (evaluation.constraintViolations === bestCandidate.constraintViolations &&
        evaluation.skillVariance < bestCandidate.skillVariance)
    ) {
      bestCandidate = evaluation;
    }

    // If we found a perfect solution, stop early
    if (evaluation.constraintViolations === 0) {
      break;
    }
  }

  return bestCandidate?.teams || [];
}

function generateConstraintAwareTeams(
  players: Player[],
  constraints: Constraint[],
  numberOfTeams: number
): Team[] {
  const teams: Team[] = [];
  const unassignedPlayers = [...players];

  // Initialize teams
  for (let i = 0; i < numberOfTeams; i++) {
    teams.push({
      id: `team-${i}`,
      name: `Team ${String.fromCharCode(65 + i)}`,
      players: [],
      totalSkill: 0,
    });
  }

  // Process "together" constraints first
  const togetherConstraints = constraints.filter(c => c.type === 'together');
  const processedPlayers = new Set<string>();

  for (const constraint of togetherConstraints) {
    if (processedPlayers.has(constraint.playerId1) || processedPlayers.has(constraint.playerId2)) {
      continue;
    }

    const player1 = players.find(p => p.id === constraint.playerId1);
    const player2 = players.find(p => p.id === constraint.playerId2);

    if (player1 && player2) {
      // Find the team with lowest total skill
      const targetTeam = teams.reduce((minTeam, team) => 
        team.totalSkill < minTeam.totalSkill ? team : minTeam
      );

      targetTeam.players.push(player1, player2);
      targetTeam.totalSkill += player1.skillLevel + player2.skillLevel;
      
      processedPlayers.add(player1.id);
      processedPlayers.add(player2.id);
      
      // Remove from unassigned
      const index1 = unassignedPlayers.findIndex(p => p.id === player1.id);
      const index2 = unassignedPlayers.findIndex(p => p.id === player2.id);
      if (index1 > -1) unassignedPlayers.splice(index1, 1);
      if (index2 > -1) unassignedPlayers.splice(index2 > index1 ? index2 - 1 : index2, 1);
    }
  }

  // Assign remaining players while respecting "separate" constraints
  const separateConstraints = constraints.filter(c => c.type === 'separate');
  
  for (const player of unassignedPlayers) {
    let assignedTeam: Team | null = null;
    
    // Sort teams by total skill to maintain balance
    const sortedTeams = [...teams].sort((a, b) => a.totalSkill - b.totalSkill);
    
    for (const team of sortedTeams) {
      // Check if placing this player would violate any "separate" constraints
      const wouldViolateSeparateConstraint = separateConstraints.some(constraint => {
        const isPlayer1 = constraint.playerId1 === player.id;
        const isPlayer2 = constraint.playerId2 === player.id;
        
        if (!isPlayer1 && !isPlayer2) return false;
        
        const otherPlayerId = isPlayer1 ? constraint.playerId2 : constraint.playerId1;
        return team.players.some(p => p.id === otherPlayerId);
      });
      
      if (!wouldViolateSeparateConstraint) {
        assignedTeam = team;
        break;
      }
    }
    
    // If no team is found that respects constraints, assign to team with lowest skill
    if (!assignedTeam) {
      assignedTeam = sortedTeams[0];
    }
    
    assignedTeam.players.push(player);
    assignedTeam.totalSkill += player.skillLevel;
  }

  return teams;
}
