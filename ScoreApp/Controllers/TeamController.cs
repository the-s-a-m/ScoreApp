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
    [Route("api/{gameId}/team")]
    public class TeamController : Controller
    {
        private readonly DataDbContext dbContext;

        public TeamController(DataDbContext context)
        {
            dbContext = context;
        }

        // GET: api/gameId/team
        [HttpGet]
        public async Task<IActionResult> GetTeams([FromRoute] long gameId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var teams = await dbContext.Teams.Where(t => t.Game.ID == gameId && t.Deleted == false).ToListAsync();
            return Ok(teams);
        }

        // GET: api/gameId/team/teamid
        [HttpGet("{teamId}")]
        public async Task<IActionResult> GetTeam([FromRoute] long gameId, [FromRoute] long teamId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (TeamDeleted(teamId))
            {
                return BadRequest();
            }

            var team = await dbContext.Teams.Where(t => t.Game.ID == gameId && t.Deleted == false && t.ID == teamId).SingleAsync();
            if (team == null)
            {
                return NotFound();
            }
            return Ok(team);
        }

        // PUT: api/gameId/team/teamid
        [HttpPut("{teamId}")]
        public async Task<IActionResult> PutTeam([FromRoute] long gameId, [FromRoute] long teamId, [FromBody] Team team)
        {
            team.Game = dbContext.Games.Where(g => g.ID == gameId).FirstOrDefault();
            if (team.Game == null)
            {
                return BadRequest("Game ID Incorrect");
            }
            ModelState.Clear();
            TryValidateModel(team);
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (teamId != team.ID || TeamDeleted(team.ID))
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
                if (!TeamExists(teamId))
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

        // POST: api/gameId/team
        [HttpPost]
        public async Task<IActionResult> PostTeam([FromRoute] long gameId, [FromBody] Team team)
        {
            ModelState.Clear();

            team.ID = 0;
            team.GamesPlayed = 0;
            team.GamesWon = 0;
            team.Deleted = false;

            team.Game = dbContext.Games.Where(g => g.ID == gameId).FirstOrDefault();
            if (team.Game == null)
            {
                return BadRequest("Game ID Incorrect");
            }
            ModelState.Clear();
            TryValidateModel(team);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var resp = dbContext.Teams.Add(team);
            await dbContext.SaveChangesAsync();

            return CreatedAtAction("GetTeam", new { id = resp.Entity.ID }, team);
        }

        // DELETE: api/gameId/team/teamid
        [HttpDelete("{teamId}")]
        public async Task<IActionResult> DeleteTeam([FromRoute] long gameId, [FromRoute] long teamId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (TeamDeleted(teamId))
            {
                return BadRequest();
            }

            var team = await dbContext.Teams.SingleOrDefaultAsync(m => m.Deleted == false && m.Game.ID == gameId && m.ID == teamId);
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
                if (!TeamExists(teamId))
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