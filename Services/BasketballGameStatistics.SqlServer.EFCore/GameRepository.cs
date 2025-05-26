using BasketballGameStatistics.SqlServer.EFCore.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BasketballGameStatistics.SqlServer.EFCore
{
    public class GameRepository : BaseRepository<Game>, IGameRepository
    {
        public GameRepository(BasketballGameStatisticsContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Game>> GetGames(int clubId, bool onlyActive = true)
        {
            var games = _context.Games.Where(g => g.ClubId == clubId);
            
            if (onlyActive) 
            { 
                games = games.Where(g => g.IsActive);
            }

            return await games.ToListAsync();
        }
    }
}