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
        type = "hunger",  
        bonus = 10,         
        Price = 5,           
        PrictureUrl = "/Users/kongxiangyi/dog_clock/assets/images/author.jpg"
    },
    new() {
        Id = 2,
        Name = "Meaty Bone",
        type = "hunger",     
        bonus = 20,         
        Price = 8,
        PrictureUrl = "/Users/kongxiangyi/dog_clock/assets/images/author.jpg"
    },
    new() {
        Id = 3,
        Name = "Toy Ball",
        type = "mood",      
        bonus = 15,         
        Price = 6,
        PrictureUrl = "/Users/kongxiangyi/dog_clock/assets/images/author.jpg"
    },
    new() {
        Id = 4,
        Name = "Chewy Treat",
        type = "hunger",      
        bonus = 12,          
        Price = 7,
        PrictureUrl = "/Users/kongxiangyi/dog_clock/assets/images/treat.jpg"
    },
    new() {
        Id = 5,
        Name = "Squeaky Toy",
        type = "mood",       
        bonus = 18,           
        Price = 9,
        PrictureUrl = "/Users/kongxiangyi/dog_clock/assets/images/toy.jpg"
    },
    new() {
        Id = 6,
        Name = "Bone Broth",
        type = "hunger",      
        bonus = 25,           
        Price = 10,
        PrictureUrl = "/Users/kongxiangyi/dog_clock/assets/images/broth.jpg"
    },
    new() {
        Id = 7,
        Name = "Crunchy Kibble",
        type = "hunger",      
        bonus = 15,           
        Price = 6,
        PrictureUrl = "/Users/kongxiangyi/dog_clock/assets/images/kibble.jpg"
    },
    new() {
        Id = 8,
        Name = "Fun Frisbee",
        type = "mood",        
        bonus = 20,           
        Price = 8,
        PrictureUrl = "/Users/kongxiangyi/dog_clock/assets/images/frisbee.jpg"
    },
    new() {
        Id = 9,
        Name = "Salty Snack",
        type = "hunger",      
        bonus = 18,           
        Price = 7,
        PrictureUrl = "/Users/kongxiangyi/dog_clock/assets/images/snack.jpg"
    },
    new() {
        Id = 10,
        Name = "Happy Frisbee",
        type = "mood",        
        bonus = 16,         
        Price = 7,
        PrictureUrl = "/Users/kongxiangyi/dog_clock/assets/images/happy_frisbee.jpg"
    },
    new() {
        Id = 11,
        Name = "Cheerful Squeak",
        type = "mood",       
        bonus = 17,           
        Price = 8,
        PrictureUrl = "/Users/kongxiangyi/dog_clock/assets/images/cheerful_squeak.jpg"
    },
    new() {
        Id = 12,
        Name = "Joyful Ribbon",
        type = "mood",       
        bonus = 15,           
        Price = 5,
        PrictureUrl = "/Users/kongxiangyi/dog_clock/assets/images/joyful_ribbon.jpg"
    }
        };
        context.Products.AddRange(products);
        context.SaveChanges();
    }
}
