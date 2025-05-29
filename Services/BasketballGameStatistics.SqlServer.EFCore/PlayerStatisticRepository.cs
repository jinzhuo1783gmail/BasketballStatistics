using BasketballGameStatistics.SqlServer.EFCore.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BasketballGameStatistics.SqlServer.EFCore
{
    public class PlayerStatisticRepository : BaseRepository<PlayerStatistic>, IPlayerStatisticRepository
    {
        public PlayerStatisticRepository(BasketballGameStatisticsContext context) : base(context)
        {
        }

        public async Task<IEnumerable<PlayerStatistic>> GetByGame(int gameId)
        {
            return await _context.PlayerStatistics
                .Where(p => p.GameId == gameId && p.IsActive)
                .OrderByDescending(p => p.CreateTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<PlayerStatistic>> GetByGameAndTeam(int gameId, int team)
        {
            return await _context.PlayerStatistics
                .Where(p => p.GameId == gameId && p.Team == team && p.IsActive)
                .ToListAsync();
        }

        public async Task<PlayerStatistic?> GetByGameTeamPlayer(int gameId, int team, int playerNumber)
        {
            return await _context.PlayerStatistics
                .FirstOrDefaultAsync(p =>
                    p.GameId == gameId &&
                    p.Team == team &&
                    p.PlayerNumber == playerNumber &&
                    p.IsActive == true);
                    
        }


        public async Task<List<PlayerStatistic>> GetGamePlayersAggregatedStats(int gameId)
        {
            return await _context.PlayerStatistics
                .Where(ps => ps.GameId == gameId && ps.IsActive && ps.PlayerNumber.HasValue && ps.Team.HasValue)
                .GroupBy(ps => new { ps.PlayerNumber, ps.Team })
                .Select(g => new PlayerStatistic
                {
                    PlayerNumber = g.Key.PlayerNumber,
                    Team = g.Key.Team,
                    Point = g.Sum(ps => ps.Point ?? 0),
                    Foul = g.Sum(ps => ps.Foul ?? 0),
                    Rebound = g.Sum(ps => ps.Rebound ?? 0),
                    Steal = g.Sum(ps => ps.Steal ?? 0),
                    Block = g.Sum(ps => ps.Block ?? 0),
                    Assist = g.Sum(ps => ps.Assist ?? 0),
                    MissShoot = g.Sum(ps => ps.MissShoot ?? 0),
                    Attempt = g.Count(ps => (ps.Point ?? 0) > 1)
                })
                .OrderBy(stats => stats.Team)
                .ThenBy(stats => stats.PlayerNumber)
                .ToListAsync();
        }
    }
}