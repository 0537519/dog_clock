using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DbInitializer
{
    public static void InitDb(WebApplication app)
    {
        using var scope=app.Services.CreateScope();
        var context=scope.ServiceProvider.GetRequiredService<StoreContext>()
          ?? throw new InvalidOperationException("Failed");
        SeedData(context);
    }

    private static void SeedData(StoreContext context)
    {
        context.Database.Migrate();
        if(context.Products.Any()) return;
        var products =new List<Product>
        {
            new() {
            Id = 1,
            Name = "Dog Biscuits",
            type = "hunger",      // Represents that it mainly satisfies hunger
            bonus = 10,          // Gives a bonus of +10 to the pet’s hunger satisfaction
            Price = 5,           // Costs 5 (units of your in-game currency)
            PrictureUrl = "/Users/kongxiangyi/dog_clock/assets/images/author.jpg"
        },
        new() {
            Id = 2,
            Name = "Meaty Bone",
            type = "hunger",      // Another item focusing on hunger
            bonus = 20,          // Higher hunger satisfaction
            Price = 8,
            PrictureUrl = "/Users/kongxiangyi/dog_clock/assets/images/author.jpg"
        },
        new() {
            Id = 3,
            Name = "Toy Ball",
            type = "mood",        // Represents that it mainly improves mood
            bonus = 15,           // +15 to mood or happiness
            Price = 6,
            PrictureUrl = "/Users/kongxiangyi/dog_clock/assets/images/author.jpg"
        }
        };
        context.Products.AddRange(products);
        context.SaveChanges();
    }
}
