using BasketballGameStatistics.SqlServer.EFCore.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BasketballGameStatistics.ViewModels
{
    public class TeamStatisticsResponseViewModel: BaseStatisticsResponseViewModel
    {
        public Game Game { get; set; } = default;

        public string TeamColor { get; set; } = string.Empty;

        public List<PlayerStatisticsResponseViewModel> PlayerStatistics { get; set; } = new List<PlayerStatisticsResponseViewModel>();
    }
}
