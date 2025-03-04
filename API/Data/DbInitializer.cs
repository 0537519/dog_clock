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
        PrictureUrl = "/assets/images/author.jpg"
    },
    new() {
        Id = 2,
        Name = "Meaty Bone",
        type = "hunger",     
        bonus = 20,         
        Price = 8,
        PrictureUrl = "/assets/images/author.jpg"
    },
    new() {
        Id = 3,
        Name = "Toy Ball",
        type = "mood",      
        bonus = 15,         
        Price = 6,
        PrictureUrl = "/assets/images/author.jpg"
    },
    new() {
        Id = 4,
        Name = "Chewy Treat",
        type = "hunger",      
        bonus = 12,          
        Price = 7,
        PrictureUrl ="/assets/images/author.jpg"
    },
    new() {
        Id = 5,
        Name = "Squeaky Toy",
        type = "mood",       
        bonus = 18,           
        Price = 9,
        PrictureUrl = "/assets/images/author.jpg"
    },
    new() {
        Id = 6,
        Name = "Bone Broth",
        type = "hunger",      
        bonus = 25,           
        Price = 10,
        PrictureUrl = "/assets/images/author.jpg"
    },
    new() {
        Id = 7,
        Name = "Crunchy Kibble",
        type = "hunger",      
        bonus = 15,           
        Price = 6,
        PrictureUrl = "/assets/images/author.jpg"
    },
    new() {
        Id = 8,
        Name = "Fun Frisbee",
        type = "mood",        
        bonus = 20,           
        Price = 8,
        PrictureUrl = "/assets/images/author.jpg"
    },
    new() {
        Id = 9,
        Name = "Salty Snack",
        type = "hunger",      
        bonus = 18,           
        Price = 7,
        PrictureUrl = "/assets/images/author.jpg"
    },
    new() {
        Id = 10,
        Name = "Happy Frisbee",
        type = "mood",        
        bonus = 16,         
        Price = 7,
        PrictureUrl = "/assets/images/author.jpg"
    },
    new() {
        Id = 11,
        Name = "Cheerful Squeak",
        type = "mood",       
        bonus = 17,           
        Price = 8,
        PrictureUrl = "/assets/images/author.jpg"
    },
    new() {
        Id = 12,
        Name = "Joyful Ribbon",
        type = "mood",       
        bonus = 15,           
        Price = 5,
        PrictureUrl = "/assets/images/author.jpg"
    }
        };
        context.Products.AddRange(products);
        context.SaveChanges();

        if(context.Users.Any()) return;
        var user=new List<User>
        {
            new(){
                Id=1,
                Name="master",
                Balance=0
            }
        };
        context.Users.AddRange(user);
        context.SaveChanges();
    }
}
