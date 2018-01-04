using System;
using System.Linq;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ScoreApp.Database
{
    public class Team
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long ID { get; set; }

        [Required]
        [StringLength(40, MinimumLength = 2)]
        public string Name { get; set; }

        [Required]
        [JsonIgnore]
        public Game Game { get; set; }

        [Required]
        public ICollection<TeamRound> Rounds { get; set; } = new List<TeamRound>();

        [Required]
        public int GamesPlayed { get; set; } = 0;

        [Required]
        public int GamesWon { get; set; } = 0;

        [Required]
        public bool Deleted { get; set; } = false;
    }
}
