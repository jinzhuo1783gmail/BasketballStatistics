using AI.FamilyEdication.ThinkingEngine.EngineModel;
using Azure.Core;
using BasketballGameStatistics.SqlServer.EFCore.Models;
using BasketballGameStatistics.ViewModels;
using BasketballGameStatisticsServices.Managers;
using Microsoft.AspNetCore.Mvc;

namespace BasketballGameStatisticsServices.Controllers
{
    [ApiController]
    [Route("api/games")]
    public class GamesController : Controller
    {
        private readonly ILogger<GamesController> _logger;
        private readonly EngineConfig _engineConfig;

        private readonly IGameManager _gameManager;
        public GamesController(ILogger<GamesController> logger, EngineConfig engineConfig, IGameManager gameManager)
        {
            _logger = logger;
            _engineConfig = engineConfig;
            _gameManager = gameManager;
        }

        [HttpPost]
        public async Task<IActionResult> AddGame([FromBody] Game request)
        {
            _logger.LogInformation("receive request Game");
            if (request == null)
                return BadRequest("Request string cannot be empty.");

            request.Instruction = _engineConfig.EngineSystemPrompt;

            var result = await _gameManager.AddGame(request);

            if (result == null) 
            { 
                return BadRequest("Failed to append request.");
            }

            return Ok(result);
        }

        [HttpGet("statistics/{Id}")]
        public async Task<IActionResult> GetGameStatistics(int Id)
        {
            _logger.LogInformation("receive request Game");

            var result = await _gameManager.GetTeamsStatistics(Id);

            if (result == null) 
            { 
                return BadRequest("Failed to get game statistics.");
            }

            return Ok(result);
        }

        [HttpGet("/{ClubId}")]
        public async Task<IActionResult> GetGames(int ClubId)
        {
            

            var result = await _gameManager.GetGames(ClubId);

            if (result == null) 
            { 
                return BadRequest($"Failed to find game from club {ClubId}.");
            }

            return Ok(result);
        }

    }
}
