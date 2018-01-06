using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ScoreApp.Database
{
    [Produces("application/json")]
    [Route("api/{gameId}/round")]
    public class RoundController : Controller
    {
        private readonly DataDbContext dbContext;

        public RoundController(DataDbContext context)
        {
            dbContext = context;
        }

        // GET: api/{gameId}/round
        [HttpGet]
        public async Task<IActionResult> GetRounds([FromRoute] long gameId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var rounds = await dbContext.Rounds.Where(r => r.Game.ID == gameId).ToListAsync();
            return Ok(rounds);
        }

        // GET: api/{gameId}/round/{roundId}
        [HttpGet("{roundId}")]
        public async Task<IActionResult> GetRound([FromRoute] long gameId, [FromRoute] long roundId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (RoundDeleted(roundId))
            {
                return BadRequest();
            }

            var round = await dbContext.Rounds.SingleOrDefaultAsync(m => m.Deleted == false && m.Game.ID == gameId && m.ID == roundId);

            if (round == null)
            {
                return NotFound();
            }

            return Ok(round);
        }

        // PUT: api/{gameId}/round/{roundId}
        [HttpPut("{roundId}")]
        public async Task<IActionResult> PutRound([FromRoute] long gameId, [FromRoute] long roundId, [FromBody] Round round)
        {
            round.Game = dbContext.Games.Where(g => g.ID == gameId).FirstOrDefault();
            if (round.Game == null)
            {
                return BadRequest("Game ID Incorrect");
            }
            ModelState.Clear();
            TryValidateModel(round);
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (roundId != round.ID || RoundDeleted(round.ID))
            {
                return BadRequest();
            }

            dbContext.Entry(round).State = EntityState.Modified;

            try
            {
                await dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoundExists(roundId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/{gameId}/round
        [HttpPost]
        public async Task<IActionResult> PostRounds([FromRoute] long gameId, [FromBody] List<Round> rounds)
        {
            foreach(var round in rounds)
            {
                round.Game = dbContext.Games.Where(g => g.ID == gameId).FirstOrDefault();
                if (round.Game == null)
                {
                    return BadRequest("Game ID Incorrect");
                }
            }
            ModelState.Clear();
            TryValidateModel(rounds);
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            dbContext.Rounds.AddRange(rounds);
            await dbContext.SaveChangesAsync();

            return CreatedAtAction("PostRounds", rounds);
        }

        // DELETE: api/{gameId}/round/{roundId}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRound([FromRoute] long gameId, [FromRoute] long roundId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (RoundDeleted(roundId))
            {
                return BadRequest();
            }

            var round = await dbContext.Rounds.SingleOrDefaultAsync(m => m.ID == roundId && m.Game.ID == gameId);
            if (round == null)
            {
                return NotFound();
            }
            if(round.Deleted)
            {
                //Return GONE Statuscode
                return StatusCode(410);
            }

            round.Deleted = true;
            dbContext.Entry(round).State = EntityState.Modified;

            try
            {
                await dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoundExists(roundId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(round);
        }

        private bool RoundExists(long id)
        {
            return dbContext.Rounds.Any(e => e.ID == id);
        }

        private bool RoundDeleted(long id)
        {
            return dbContext.Rounds.Any(e => e.ID == id && e.Deleted == true);
        }
    }
}