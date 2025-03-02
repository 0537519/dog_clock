namespace API.Entities;

public class UserItem
{
    public int ItemId { get; set; }
    public required string Name { get; set; }
    public required string type { get; set; }
    public int bonus { get; set; }
    public int Price { get; set; }
    public required string PrictureUrl { get; set; }
    public int Quantity { get; set; }
}
