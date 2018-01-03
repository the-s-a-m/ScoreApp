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
    [Route("api/Round")]
    public class RoundController : Controller
    {
        private readonly DataDbContext dbContext;

        public RoundController(DataDbContext context)
        {
            dbContext = context;
        }

        // GET: api/Round
        [HttpGet]
        public IEnumerable<Round> GetRound()
        {
            return dbContext.Rounds;
        }

        // GET: api/Round/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRound([FromRoute] long id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (RoundDeleted(id))
            {
                return BadRequest();
            }

            var round = await dbContext.Rounds.SingleOrDefaultAsync(m => m.Deleted == false && m.ID == id);

            if (round == null)
            {
                return NotFound();
            }

            return Ok(round);
        }

        // PUT: api/Round/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRound([FromRoute] long id, [FromBody] Round round)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != round.ID || RoundDeleted(round.ID))
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
                if (!RoundExists(id))
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

        // POST: api/Round
        [HttpPost]
        public async Task<IActionResult> PostRound([FromBody] Round round)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            dbContext.Rounds.Add(round);
            await dbContext.SaveChangesAsync();

            return CreatedAtAction("GetRound", new { id = round.ID }, round);
        }

        // DELETE: api/Round/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRound([FromRoute] long id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (RoundDeleted(id))
            {
                return BadRequest();
            }

            var round = await dbContext.Rounds.SingleOrDefaultAsync(m => m.ID == id);
            if (round == null)
            {
                return NotFound();
            }

            round.Deleted = true;
            dbContext.Entry(round).State = EntityState.Modified;

            try
            {
                await dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoundExists(id))
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