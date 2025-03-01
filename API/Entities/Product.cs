namespace API.Entities;

public class Product
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string type { get; set; }
    public int bonus { get; set; }
    public int Price { get; set; }
    public required string PrictureUrl { get; set; }
    
}
