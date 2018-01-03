using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ScoreApp.Database
{
    public class TeamRound
    {
        public long RoundId { get; set; }
        public Round Round { get; set; }

        public long TeamId { get; set; }
        public Team Team { get; set; }
    }
}
