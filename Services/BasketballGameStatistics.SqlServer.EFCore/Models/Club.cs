using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BasketballGameStatistics.SqlServer.EFCore.Models
{
    public class Club
    {
        public int Id { get; set; }
        public string ClubName { get; set; } = string.Empty;
        public string? ClubAddress { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public ICollection<Game> Games { get; set; } = new List<Game>();
    }
}