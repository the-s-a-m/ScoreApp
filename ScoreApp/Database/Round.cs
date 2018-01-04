using Newtonsoft.Json;
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

        /// <summary>
        /// Contains key value array.
        /// Key = teamId, value gained points.
        /// Use RoundScores to edit
        /// </summary>
        [Required]
        [JsonIgnore]
        public string RoundScoresJSON { get; set; } = "{}";

        /// <summary>
        /// Representation of RoundScoresJSON. 
        /// Attention: Directly assign object and do no change inside dict.
        /// </summary>
        [NotMapped]
        public IDictionary<long, int> RoundScores
        {
            get
            {
                return JsonConvert.DeserializeObject<IDictionary<long, int>>(RoundScoresJSON);
            }
            set
            {
                RoundScoresJSON = JsonConvert.SerializeObject(value);
            }
        }

        [Required]
        public bool Deleted { get; set; } = false;
    }
}
