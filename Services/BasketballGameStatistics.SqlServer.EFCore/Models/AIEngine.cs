using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BasketballGameStatistics.SqlServer.EFCore.Models
{
    public class AIEngine
    {
        public long Id { get; set; }
        public string EnginKey { get; set; } = string.Empty;
        public string ModelHigh { get; set; } = string.Empty;
        public string ModelMedium { get; set; } = string.Empty;

        public string ModelLow { get; set; } = string.Empty;
        public string Endpoint { get; set; } = string.Empty;

        public string ApiKey { get; set; } = string.Empty;
    }
}