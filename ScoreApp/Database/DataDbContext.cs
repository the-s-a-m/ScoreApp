using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ScoreApp.Database;

namespace ScoreApp.Database
{
    public class DataDbContext : DbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite("Filename=./GameScore.db");
        }

        public DbSet<Game> Games { get; set; }

        public DbSet<Team> Teams { get; set; }

        public DbSet<Round> Rounds { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TeamRound>()
                .HasKey(bc => new { bc.RoundId, bc.TeamId });

            modelBuilder.Entity<TeamRound>()
                .HasOne(bc => bc.Round)
                .WithMany(b => b.Teams)
                .HasForeignKey(bc => bc.RoundId);

            modelBuilder.Entity<TeamRound>()
                .HasOne(bc => bc.Team)
                .WithMany(c => c.Rounds)
                .HasForeignKey(bc => bc.TeamId);
        }

    }
}
