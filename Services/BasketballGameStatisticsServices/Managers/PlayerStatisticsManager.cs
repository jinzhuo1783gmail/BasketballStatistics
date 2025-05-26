using AI.Thinking.Engine;
using AI.Thinking.Engine.RequestViewModel;
using BasketballGameStatistics.SqlServer.EFCore;
using BasketballGameStatistics.SqlServer.EFCore.Models;
using Microsoft.CognitiveServices.Speech;
using Newtonsoft.Json;
using System.Text.RegularExpressions;

namespace BasketballGameStatisticsServices.Managers
{
    public class PlayerStatisticsManager : IPlayerStatisticsManager
    {
        private readonly ILogger<PlayerStatisticsManager> _logger;
        private readonly IPlayerStatisticRepository _repository;
        private readonly IGameRepository _gameRepository;
        private readonly IAIEngineAnalysis _aIEngineAnalysis;
        private readonly IAIEngineVoice _aIEngineVoice;
        public PlayerStatisticsManager( ILogger<PlayerStatisticsManager> logger, 
                                        IPlayerStatisticRepository repository, 
                                        IAIEngineAnalysis aIEngineAnalysis,
                                        IGameRepository gameRepository,
                                        IAIEngineVoice aIEngineVoice) 
        {
            _logger = logger;
            _repository = repository;
            _aIEngineAnalysis = aIEngineAnalysis;
            _aIEngineVoice = aIEngineVoice;
            _gameRepository = gameRepository;
        }

        public async Task<PlayerStatistic> AddSingleVoiceStatistic(int matchId, string base64, string language)
        {

            var game = await _gameRepository.GetById(matchId);

            if (game == null)
            {
                throw new Exception($"No game with game id {matchId} in the system.");
            }
            _logger.LogInformation("conerting speech to text");
            var result = await _aIEngineVoice.SpeechToText(base64, language);

            if (result.Reason == ResultReason.NoMatch)
            {
                _logger.LogError("No speech could be recognized.");
                throw new Exception("No speech could be recognized.");
            }
                

            if (result.Reason == ResultReason.Canceled)
            {
                var cancellation = CancellationDetails.FromResult(result);

                var failedReason = cancellation.Reason.ToString();
                
                _logger.LogError($"STT failed: {cancellation.Reason}");
                                
                if (cancellation.Reason == CancellationReason.Error)
                {
                    failedReason += $"ErrorCode={cancellation.ErrorCode}, ErrorDetails={cancellation.ErrorDetails}";
                }
                _logger.LogError(failedReason);
                throw new Exception(failedReason);
            }


            var request = new ChatGptRequestViewModel();
            request.Model = _aIEngineAnalysis.GetHighModel();
            request.Messages = new List<ChatMessage>()
            {
                new ChatMessage()
                {
                    Role = "system",
                    Content = @game.Instruction ?? "Please reformat text into color, number, action",
                },
                new ChatMessage()
                {
                    Role = "user",
                    Content = result.Text,
                },
            };

            _logger.LogInformation("reformat text result");

            var jsonResponse = await _aIEngineAnalysis.GetAnswerFromAI(request);

            var response = JsonConvert.DeserializeObject<ChatCompletionResponse>(jsonResponse);


            // assume it will return json body
            var convertedText = response.Choices[0].Message.Content;

            var convertedJsonString = Regex.Match(convertedText ?? string.Empty, @"\{.*\}").Value;

            var statistic = JsonConvert.DeserializeObject<PlayerStatistic>(convertedJsonString);

            if (!statistic!.Team.IsValidInput())
            {
                throw new Exception($"team is missing with input text {convertedText}");
            }

            if (!statistic!.PlayerNumber.IsValidInput())
            {
                throw new Exception($"PlayerNumber is missing with input text {convertedText}");
            }

            if (!statistic!.Point.IsValidInput() && 
                !statistic!.Assist.IsValidInput() &&
                !statistic!.Foul.IsValidInput() &&
                !statistic!.Rebound.IsValidInput() &&
                !statistic!.MissShoot.IsValidInput() &&
                !statistic!.Steal.IsValidInput() &&
                !statistic!.Block.IsValidInput())
                
            {
                throw new Exception($"Event is missing with input text {convertedText}");
            }

            statistic!.GameId = matchId;
            statistic!.CreateTime = DateTime.UtcNow;
            statistic!.InputText = result.Text;
            // persist

            return await _repository.Add(statistic);
        }

        public async Task<bool> RevertPlayerStatistic(long Id)
        {
            var statistic = await _repository.GetByLongId(Id);

            if ( statistic == null)
            {
                throw new Exception($"statistics with id {Id} does not exist");                                    
            }

            statistic.IsActive = false;
            await _repository.Update(statistic);
            return true;

            
        }
    }

}
