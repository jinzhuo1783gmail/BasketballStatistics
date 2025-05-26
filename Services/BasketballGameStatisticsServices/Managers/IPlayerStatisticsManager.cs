using BasketballGameStatistics.SqlServer.EFCore.Models;

namespace BasketballGameStatisticsServices.Managers
{
    public interface IPlayerStatisticsManager
    {
        Task<PlayerStatistic> AddSingleVoiceStatistic(int matchId, string base64, string language);

        Task<bool> RevertPlayerStatistic(long Id);
    }
}
