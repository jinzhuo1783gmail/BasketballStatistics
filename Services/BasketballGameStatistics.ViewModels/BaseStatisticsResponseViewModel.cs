using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BasketballGameStatistics.ViewModels
{
    public class BaseStatisticsResponseViewModel
    {
        public int ShootAttempt { get; set; }
        public int ShootMiss { get; set; }
        public int Point { get; set; }

        public int Rebound { get; set; }

        public int Assist { get; set; }

        public int Steal { get; set; }
        public int Block { get; set; }

    }
}
