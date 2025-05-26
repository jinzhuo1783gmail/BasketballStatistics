using BasketballGameStatistics.SqlServer.EFCore.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace BasketballGameStatistics.SqlServer.EFCore
{
    public class BasketballGameStatisticsContext : DbContext
    {
        public BasketballGameStatisticsContext(DbContextOptions<BasketballGameStatisticsContext> options) : base(options)
        {
        }

        public DbSet<Club> Clubs => Set<Club>();
        public DbSet<Game> Games => Set<Game>();
        public DbSet<PlayerStatistic> PlayerStatistics => Set<PlayerStatistic>();

        public DbSet<AIEngine> AIEngines { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Club configuration
            modelBuilder.Entity<Club>()
                .HasMany(c => c.Games)
                .WithOne(g => g.Club)
                .HasForeignKey(g => g.ClubId);

            // Game configuration
            modelBuilder.Entity<Game>()
                .HasMany(g => g.PlayerStatistics)
                .WithOne(p => p.Game)
                .HasForeignKey(p => p.GameId);

            // Configure Unicode support for Game.Instruction property
            modelBuilder.Entity<Game>()
                .Property(g => g.Instruction)
                .IsUnicode(true);

            // PlayerStatistic configuration
            modelBuilder.Entity<PlayerStatistic>()
                .HasIndex(p => new { p.GameId, p.Team, p.PlayerNumber })
                .IsUnique();

            modelBuilder.Entity<PlayerStatistic>()
                .HasIndex(p => new { p.GameId, p.Team });
        }
    }
}