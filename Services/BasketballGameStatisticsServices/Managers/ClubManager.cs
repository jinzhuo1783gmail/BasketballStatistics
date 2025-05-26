using BasketballGameStatistics.SqlServer.EFCore;
using BasketballGameStatistics.SqlServer.EFCore.Models;

namespace BasketballGameStatisticsServices.Managers
{
    public class ClubManager : IClubManager
    {
        private readonly ILogger<ClubManager> _logger;
        private readonly IClubRepository _clubRepository;
        public ClubManager(ILogger<ClubManager> logger, IClubRepository clubRepository) 
        { 
            _logger = logger;
            _clubRepository = clubRepository;   
        }
        public async Task<Club?> GetClubByName(string ClubName)
        {
            return await _clubRepository.GetClubByName(ClubName);
        }
    }
}
