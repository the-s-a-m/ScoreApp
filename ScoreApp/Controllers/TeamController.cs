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
    [Route("api/Team")]
    public class TeamController : Controller
    {
        private readonly DataDbContext dbContext;

        public TeamController(DataDbContext context)
        {
            dbContext = context;
        }

        // GET: api/Team
        [HttpGet]
        public IEnumerable<Team> GetTeam()
        {
            return dbContext.Teams;
        }

        // GET: api/Team/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTeam([FromRoute] long id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (TeamDeleted(id))
            {
                return BadRequest();
            }

            var team = await dbContext.Teams.SingleOrDefaultAsync(m => m.Deleted == false && m.ID == id);

            if (team == null)
            {
                return NotFound();
            }

            return Ok(team);
        }

        // PUT: api/Team/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTeam([FromRoute] long id, [FromBody] Team team)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != team.ID || TeamDeleted(team.ID))
            {
                return BadRequest();
            }

            dbContext.Entry(team).State = EntityState.Modified;

            try
            {
                await dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TeamExists(id))
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

        // POST: api/Team
        [HttpPost]
        public async Task<IActionResult> PostTeam([FromBody] Team team)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            team.ID = 0;
            team.GamesPlayed = 0;
            team.GamesWon = 0;
            team.Deleted = false;

            var resp = dbContext.Teams.Add(team);
            await dbContext.SaveChangesAsync();

            return CreatedAtAction("GetTeam", new { id = resp.Entity.ID }, team);
        }

        // DELETE: api/Team/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTeam([FromRoute] long id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (TeamDeleted(id))
            {
                return BadRequest();
            }

            var team = await dbContext.Teams.SingleOrDefaultAsync(m => m.Deleted == false && m.ID == id);
            if (team == null)
            {
                return NotFound();
            }

            team.Deleted = true;
            dbContext.Entry(team).State = EntityState.Modified;

            try
            {
                await dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TeamExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(team);
        }

        private bool TeamExists(long id)
        {
            return dbContext.Teams.Any(e => e.ID == id);
        }

        private bool TeamDeleted(long id)
        {
            return dbContext.Teams.Any(e => e.ID == id && e.Deleted == true);
        }
    }
}