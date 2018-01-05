using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreApp.Database;

namespace ScoreApp.Controllers
{
    [Produces("application/json")]
    [Route("api/game")]
    public class GameController : Controller
    {
        private readonly DataDbContext dbContext;

        public GameController(DataDbContext context)
        {
            dbContext = context;
        }

        // GET: api/Game
        [HttpGet]
        public IEnumerable<Game> GetGames()
        {
            return dbContext.Games;
        }

        // GET: api/game/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetGame([FromRoute] long id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (GameDeleted(id))
            {
                return BadRequest();
            }

            var game = await dbContext.Games.SingleOrDefaultAsync(m => m.ID == id);

            if (game == null)
            {
                return NotFound();
            }

            return Ok(game);
        }

        // GET: api/game/5
        [HttpGet("{id}/all")]
        public async Task<IActionResult> GetGameAll([FromRoute] long id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (GameDeleted(id))
            {
                return BadRequest();
            }

            var game = await dbContext.Games.Include(e => e.PlayingRounds).Include(e => e.Teams).SingleOrDefaultAsync(m => m.ID == id);

            if (game == null)
            {
                return NotFound();
            }

            return Ok(game);
        }

        // PUT: api/game/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutGame([FromRoute] long id, [FromBody] Game game)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != game.ID || GameDeleted(id))
            {
                return BadRequest();
            }

            dbContext.Entry(game).State = EntityState.Modified;

            try
            {
                await dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GameExists(id))
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

        // POST: api/game
        [HttpPost]
        public async Task<IActionResult> PostGame([FromBody] Game game)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            game.Created = DateTime.Now;
            dbContext.Games.Add(game);
            await dbContext.SaveChangesAsync();

            return CreatedAtAction("GetGame", new { id = game.ID }, game);
        }

        // DELETE: api/game/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGame([FromRoute] long id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (GameDeleted(id))
            {
                return BadRequest();
            }

            var game = await dbContext.Games.SingleOrDefaultAsync(m => m.ID == id);
            if (game == null)
            {
                return NotFound();
            }

            game.Deleted = true;
            dbContext.Entry(game).State = EntityState.Modified;

            try
            {
                await dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GameExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(game);
        }

        private bool GameExists(long id)
        {
            return dbContext.Games.Any(e => e.ID == id);
        }

        private bool GameDeleted(long id)
        {
            return dbContext.Games.Any(e => e.ID == id && e.Deleted == true);
        }
    }
}