using BasketballGameStatistics.SqlServer.EFCore;
using BasketballGameStatistics.SqlServer.EFCore.Models;
using BasketballGameStatistics.ViewModels;

namespace BasketballGameStatisticsServices.Managers
{
    public class GameManager : IGameManager
    {
        private readonly ILogger<GameManager> _logger;
        private readonly IGameRepository _repository;
        private readonly IPlayerStatisticRepository _playerStatisticRepository;

        public GameManager(ILogger<GameManager> logger, IGameRepository repository, IPlayerStatisticRepository playerStatisticRepository)
        {
            _logger = logger;
            _repository = repository;
            _playerStatisticRepository = playerStatisticRepository;
        }

        public async Task<IEnumerable<Game>> GetGames(int ClubId, bool onlyActive = true)
        {
            return await _repository.GetGames(ClubId, onlyActive);
        }

        public async Task<Game> AddGame(Game game)
        {
            return await _repository.Add(game);
        }

        public async Task<Game> UpdateGame(Game game)
        {
            var updateGame = await _repository.GetById(game.Id);

            if (updateGame != null) 
            { 
                updateGame.Venue = game.Venue;
                updateGame.GameDescription = game.GameDescription;
                updateGame.MatchDate = game.MatchDate;

                await _repository.Save();
                return updateGame;
            }

            throw new Exception($"Game with id {game.Id} does not exist in the db ");
        }

        public async Task<bool> DeactivateGames(int gameId)
        {
            var existGame = await _repository.GetById(gameId);
            if (existGame == null)
            {
                throw new Exception($"Game with Id {gameId} does not exist");
            }

            existGame.IsActive = false;

            await _repository.Update(existGame);
            return true;
        }

        public async Task<List<TeamStatisticsResponseViewModel>> GetTeamsStatistics(int gameId)
        {
            var playerStatistics = await _playerStatisticRepository.GetGamePlayersAggregatedStats(gameId);
            var existGame = await _repository.GetById(gameId);
            if (existGame == null)
                throw new Exception($"game with id {gameId} does not exist");
            
            existGame!.Instruction = string.Empty;

            var light = playerStatistics.Where(p => p.Team == 1);
            var dark = playerStatistics.Where(p => p.Team == 2);

            var lightStatisticsResponseViewModel = ConvertToTeamStats(light, "light", existGame!);

            var darkStatisticsResponseViewModel = ConvertToTeamStats(dark, "dark", existGame!);

            return new List<TeamStatisticsResponseViewModel>() { lightStatisticsResponseViewModel, darkStatisticsResponseViewModel };

        }

        private TeamStatisticsResponseViewModel ConvertToTeamStats (IEnumerable<PlayerStatistic>? playerStatistics, string team, Game game ) => new TeamStatisticsResponseViewModel()
        { 
            Game = game,
            TeamColor = team,
            Rebound = playerStatistics!.Sum(p => p.Rebound) ?? 0,
            Assist = playerStatistics!.Sum(p => p.Assist) ?? 0,
            Point = playerStatistics!.Sum(p => p.Point) ?? 0,
            Steal = playerStatistics!.Sum(p => p.Steal) ?? 0,
            Block = playerStatistics!.Sum(p => p.Block) ?? 0,
            ShootAttempt = playerStatistics!.Sum(p => p.Attempt ?? 0),
            ShootMiss = playerStatistics!.Sum(p => p.MissShoot ?? 0),

            PlayerStatistics =  playerStatistics!.Select(p => 
                                    new PlayerStatisticsResponseViewModel() { 
                                        PlayerNumber = p.PlayerNumber ?? 0,
                                        Assist = p.Assist ?? 0,
                                        Point = p.Point ?? 0,
                                        Rebound = p.Rebound ?? 0,
                                        Steal = p.Steal ?? 0,
                                        Block = p.Block ?? 0,
                                        ShootAttempt = p.Attempt ?? 0,
                                        ShootMiss = p.MissShoot ?? 0,
                                    }).ToList()
        };
    }
}