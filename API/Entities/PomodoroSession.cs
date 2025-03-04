namespace API.Entities;

public class PomodoroSession
{
    public int Id { get; set; }
    public required string TaskTag { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public TimeSpan Duration { get; set; }
    public bool IsCompleted { get; set; }
    public int RewardPoints { get; set; }
}
