using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ScoreApp.Database
{
    public class Game
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long ID { get; set; }

        [Required]
        public DateTime Created { get; set; } = DateTime.Now;

        [Required]
        [StringLength(40, MinimumLength=2)]
        public string Name { get; set; }

        [Required]
        public ICollection<Team> Teams { get; set; } = new List<Team>();

        [Required]
        public ICollection<Round> PlayingRounds { get; set; } = new List<Round>();

        [Required]
        public bool Deleted { get; set; } = false;

        public DateTime Started { get; set; }

        public DateTime Ended { get; set; }
    }
}
