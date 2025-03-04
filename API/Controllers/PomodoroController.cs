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
        // 用于新增 PomodoroSession，输入为 Duration (TimeSpan) 和 TaskTag (string)
        [HttpPost]
        public async Task<ActionResult<PomodoroSession>> CreatePomodoroSession([FromBody] PomodoroSessionCreateRequest request)
        {
            var session = new PomodoroSession
            {
                TaskTag = request.TaskTag,
                StartTime = DateTime.Now,
                Duration = request.Duration,
                EndTime = default(DateTime), // 为空，表示未结束
                IsCompleted = false,
                RewardPoints = 0
            };

            _context.pomodoroSessions.Add(session);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPomodoroSession), new { id = session.Id }, session);
        }
    }

    public class PomodoroSessionCreateRequest
    {
        public required string TaskTag { get; set; }
        public TimeSpan Duration { get; set; }
    }
}
