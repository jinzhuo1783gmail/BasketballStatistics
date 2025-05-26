using BasketballGameStatistics.SqlServer.EFCore.Models;

namespace BasketballGameStatisticsServices.Managers
{
    public interface IClubManager
    {
        Task<Club?> GetClubByName(string ClubName);
    }
}
