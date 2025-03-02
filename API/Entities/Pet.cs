namespace API.Entities;

public class Pet
{
    public int PetId { get; set; }
    public required string Name { get; set; }
    public int Level { get; set; }
    public int Exp { get; set; }
    public int Hunger { get; set; }
    public int Mood { get; set; }
    public bool IsHealthy { get; set; }=true;
    public bool IsDead{ get; set; }=false;
    public DateTime Birthday { get; set; }
    public TimeSpan Age { get; set; }
}
