namespace API.Entities;

public class Pet
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public int Hunger { get; set; }
    public int Mood { get; set; }
    public bool IsHealthy { get; set; } = true;
    public bool IsDead { get; set; } = false;
    public DateTime Birthday { get; set; }
    public TimeSpan Age { get; set; } 
    public DateTime Last_feed { get; set; }
    public DateTime Last_play { get; set; }
    public TimeSpan UnhealthyTime { get; set; }
    public decimal DeadAge { get; set; }
}
