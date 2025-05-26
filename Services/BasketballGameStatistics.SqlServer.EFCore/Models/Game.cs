using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BasketballGameStatistics.SqlServer.EFCore.Models
{
    public class Game
    {
        public int Id { get; set; }
        public int ClubId { get; set; }
        public Club? Club { get; set; }
        public string GameDescription { get; set; } = string.Empty;
        public string Venue { get; set; } = string.Empty;
        public DateTime? MatchDate { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public bool IsActive { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string? Instruction { get; set; } = string.Empty;
        public ICollection<PlayerStatistic> PlayerStatistics { get; set; } = new List<PlayerStatistic>();
    }
}