using BasketballGameStatistics.SqlServer.EFCore.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BasketballGameStatistics.SqlServer.EFCore
{
    public class ClubRepository : BaseRepository<Club>, IClubRepository
    {
        public ClubRepository(BasketballGameStatisticsContext context) : base(context)
        {
        }

        public async Task<Club?> GetClubByName(string clubName)
        {
            return await _context.Clubs.FirstOrDefaultAsync(c => c.ClubName == clubName);
        }
    }
}