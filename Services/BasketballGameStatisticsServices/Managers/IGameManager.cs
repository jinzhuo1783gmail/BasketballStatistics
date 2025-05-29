using BasketballGameStatistics.SqlServer.EFCore.Models;
using BasketballGameStatistics.ViewModels;

namespace BasketballGameStatisticsServices.Managers
{
    public interface IGameManager
    {
        Task<IEnumerable<Game>> GetGames(int ClubId, bool onlyActive = true);

        Task<Game> AddGame(Game game);
        Task<bool> DeactivateGames(int gameId);
        Task<Game> UpdateGame(Game game);
        Task<List<TeamStatisticsResponseViewModel>> GetTeamsStatistics(int gameId);
    }
}
