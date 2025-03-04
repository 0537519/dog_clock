using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PomodoroController : ControllerBase
    {
        private readonly StoreContext _context;

        public PomodoroController(StoreContext context)
        {
            _context = context;
        }

        // GET: api/Pomodoro
        [HttpGet]
        public async Task<ActionResult<List<PomodoroSession>>> GetPomodoroSessions()
        {
            return await _context.pomodoroSessions.ToListAsync();
        }

        // GET: api/Pomodoro/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PomodoroSession>> GetPomodoroSession(int id)
        {
            var session = await _context.pomodoroSessions.FindAsync(id);
            if (session == null)
                return NotFound();
            return session;
        }

        // POST: api/Pomodoro
        [HttpPost]
        public async Task<ActionResult<PomodoroSession>> CreatePomodoroSession([FromBody] PomodoroSessionCreateRequest request)
        {
            var session = new PomodoroSession
            {
                TaskTag = request.TaskTag,
                StartTime = DateTime.Now,
                Duration = request.Duration,
                EndTime = default(DateTime),
                IsCompleted = false,
                RewardPoints = 0
            };

            _context.pomodoroSessions.Add(session);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPomodoroSession), new { id = session.Id }, session);
        }

        // PUT: api/Pomodoro/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePomodoroSession(int id, [FromBody] UpdatePomodoroSessionRequest request)
        {
            var session = await _context.pomodoroSessions.FindAsync(id);
            if (session == null)
                return NotFound();

            session.EndTime = DateTime.Now;
            session.IsCompleted = request.IsCompleted;
            session.RewardPoints = (int)(session.EndTime - session.StartTime).TotalMinutes * 2;

            _context.pomodoroSessions.Update(session);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class PomodoroSessionCreateRequest
    {
        public required string TaskTag { get; set; }
        public TimeSpan Duration { get; set; }
    }

    public class UpdatePomodoroSessionRequest
    {
        public bool IsCompleted { get; set; }
    }
}
