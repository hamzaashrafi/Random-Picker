import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PlayerStats {
  id: string;
  name: string;
  wins: number;
  losses: number;
  totalMatches: number;
  winRate: number;
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*');

      if (playersError) throw playersError;

      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*');

      if (matchesError) throw matchesError;

      const playerStats: Record<string, PlayerStats> = {};

      players?.forEach((player) => {
        playerStats[player.id] = {
          id: player.id,
          name: player.name,
          wins: 0,
          losses: 0,
          totalMatches: 0,
          winRate: 0,
        };
      });

      matches?.forEach((match) => {
        const team1Players = [match.team1_player1_id, match.team1_player2_id];
        const team2Players = [match.team2_player1_id, match.team2_player2_id];

        if (match.winning_team === 1) {
          team1Players.forEach((playerId) => {
            if (playerStats[playerId]) {
              playerStats[playerId].wins++;
              playerStats[playerId].totalMatches++;
            }
          });
          team2Players.forEach((playerId) => {
            if (playerStats[playerId]) {
              playerStats[playerId].losses++;
              playerStats[playerId].totalMatches++;
            }
          });
        } else {
          team2Players.forEach((playerId) => {
            if (playerStats[playerId]) {
              playerStats[playerId].wins++;
              playerStats[playerId].totalMatches++;
            }
          });
          team1Players.forEach((playerId) => {
            if (playerStats[playerId]) {
              playerStats[playerId].losses++;
              playerStats[playerId].totalMatches++;
            }
          });
        }
      });

      const leaderboard = Object.values(playerStats)
        .map((player) => ({
          ...player,
          winRate: player.totalMatches > 0 
            ? (player.wins / player.totalMatches) * 100 
            : 0,
        }))
        .sort((a, b) => {
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.winRate - a.winRate;
        });

      return leaderboard;
    },
  });
}
