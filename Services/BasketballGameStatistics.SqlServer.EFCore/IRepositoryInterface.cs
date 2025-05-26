using BasketballGameStatistics.SqlServer.EFCore.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BasketballGameStatistics.SqlServer.EFCore
{
    public interface IRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAll();

        Task<T?> GetById(int id);
        Task<T?> GetByLongId(long id);

        Task<T> Add(T entity);

        Task Update(T entity);

        Task Delete(int id);
    }

    public interface IClubRepository : IRepository<Club>
    {
        Task<Club?> GetClubByName(string clubName);
    }

    public interface IGameRepository : IRepository<Game>
    {
        Task<IEnumerable<Game>> GetGames(int clubId, bool onlyActive = true);
    }

    public interface IPlayerStatisticRepository : IRepository<PlayerStatistic>
    {
        Task<IEnumerable<PlayerStatistic>> GetByGameAndTeam(int gameId, int team);
        Task<PlayerStatistic?> GetByGameTeamPlayer(int gameId, int team, int playerNumber);

        Task<List<PlayerStatistic>> GetGamePlayersAggregatedStats(int gameId);
    }
}