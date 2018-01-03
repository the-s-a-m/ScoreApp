using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ScoreApp.Database
{
    public class Round
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long ID { get; set; }

        [Required]
        public Game Game { get; set; }

        [Required]
        public ICollection<TeamRound> Teams { get; set; } = new List<TeamRound>();

        [Required]
        public bool Deleted { get; set; } = false;
    }
}
