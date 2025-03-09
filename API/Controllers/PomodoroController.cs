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

        [HttpGet]
        public async Task<ActionResult<List<PomodoroSession>>> GetPomodoroSessions()
        {
            return await _context.pomodoroSessions.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PomodoroSession>> GetPomodoroSession(int id)
        {
            var session = await _context.pomodoroSessions.FindAsync(id);
            if (session == null)
                return NotFound();
            return session;
        }

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

        // 修改 update-on-unload 接口，支持同时接收 ActualDuration 字段
        [HttpPut("{id}/update-on-unload")]
        [HttpPost("{id}/update-on-unload")]
        public async Task<IActionResult> UpdateOnUnload(int id, [FromBody] UpdatePomodoroSessionRequest request)
        {
            var session = await _context.pomodoroSessions.FindAsync(id);
            if (session == null) return NotFound();

            // 如果 ActualDuration 存在，则使用它计算 endTime，否则以当前时间作为 endTime
            if (request.ActualDuration > 0)
            {
                session.EndTime = session.StartTime.AddSeconds(request.ActualDuration);
                if (session.EndTime > DateTime.Now)
                    session.EndTime = DateTime.Now;
            }
            else
            {
                session.EndTime = DateTime.Now;
            }
            session.IsCompleted = request.IsCompleted;
            session.RewardPoints = (int)(session.EndTime - session.StartTime).TotalMinutes * 2;

            _context.pomodoroSessions.Update(session);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("total-count")]
        public async Task<ActionResult<int>> GetTotalSessionCount()
        {
            int count = await _context.pomodoroSessions.CountAsync();
            return Ok(count);
        }

        [HttpGet("total-focus")]
        public async Task<ActionResult<double>> GetTotalFocusMinutes()
        {
            var sessions = await _context.pomodoroSessions
                                         .Where(s => s.EndTime > s.StartTime)
                                         .ToListAsync();
            double totalMinutes = sessions.Sum(s => (s.EndTime - s.StartTime).TotalMinutes);
            return Ok(totalMinutes);
        }

        [HttpGet("completion-rate")]
        public async Task<ActionResult<string>> GetCompletionRate()
        {
            int totalCount = await _context.pomodoroSessions.CountAsync();
            if (totalCount == 0)
                return Ok("0%");
            int completedCount = await _context.pomodoroSessions.CountAsync(s => s.IsCompleted == true);
            double rate = (double)completedCount / totalCount * 100;
            return Ok($"{rate:F2}%");
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
        public int ActualDuration { get; set; }
    }
}
