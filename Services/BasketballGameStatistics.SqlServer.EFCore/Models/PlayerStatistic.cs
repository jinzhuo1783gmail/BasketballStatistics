using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BasketballGameStatistics.SqlServer.EFCore.Models
{
    public class PlayerStatistic
    {
        public long Id { get; set; }
        public int GameId { get; set; }
        public Game Game { get; set; } = null!;
        public int? Team { get; set; }
        public int? PlayerNumber { get; set; }
        public int? Point { get; set; }
        public int? Foul { get; set; }
        public int? Rebound { get; set; }
        public int? Steal { get; set; }
        public int? Block { get; set; }

        [NotMapped]
        public int? Attempt { get; set; }

        public bool IsActive { get; set; } = true;
        public int? MissShoot { get; set; }
        public int? Assist { get; set; }
        public string? InputText { get; set; } = string.Empty;
        public DateTime? CreateTime { get; set; }
    }
}