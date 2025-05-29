using BasketballGameStatistics.ViewModels;
using BasketballGameStatisticsServices.Managers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BasketballGameStatisticsServices.Controllers
{
    [ApiController]
    [Route("api/playerstatistics")]
    public class PlayerStatisticsController : ControllerBase
    {
        private readonly ILogger<PlayerStatisticsController> _logger;
        private readonly IPlayerStatisticsManager _playerStatisticsManager;

        public PlayerStatisticsController(ILogger<PlayerStatisticsController> logger, IPlayerStatisticsManager playerStatisticsManager)
        {
            _logger = logger;
            _playerStatisticsManager = playerStatisticsManager;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AppendPlayerStatistic([FromBody] PlayerStatisticsVoiceRequestViewModel request)
        {
            _logger.LogInformation("receive request PlayerStatisticsVoiceRequestViewModel");
            if (request == null)
                return BadRequest("Request string cannot be empty.");

            var result = await _playerStatisticsManager.AddSingleVoiceStatistic(request.GameId, request.VoiceBase64, request.Language);

            if (result == null) 
            { 
                return BadRequest("Failed to append request.");
            }

            return Ok(result);
        }

        [Authorize]
        [HttpGet("game/{Id}")]
        public async Task<IActionResult> GetPlayerStatisticByGame(int Id)
        {
            _logger.LogInformation($"receive request GetPlayerStatisticByGame with game id {Id}");

            var result = await _playerStatisticsManager.GetPlayerStatisticByGame(Id);

            if (result == null) 
            { 
                return BadRequest("Failed to GetPlayerStatisticByGame request.");
            }

            return Ok(result);
        }

        [Authorize]
        [HttpPatch("revert")]
        public async Task<IActionResult> RevertPlayerStatistic([FromBody] RevertPlayerStaticsViewModel request)
        {
            _logger.LogInformation("receive request RevertPlayerStaticsViewModel");
            if (request == null)
                return BadRequest("Request string cannot be empty.");

            var result = await _playerStatisticsManager.RevertPlayerStatistic(request.Id);

            if (!result) 
            { 
                return BadRequest("Failed to revert statistics.");
            }

            return Ok(result);
        }
    }
}
