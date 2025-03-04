using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserItemsController(StoreContext context) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<UserItem>>> GetUserItems()
        {
            return await context.userItems.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserItem>> GetUserItem(int id)
        {
            var item = await context.userItems.FindAsync(id);
            if (item == null) return NotFound("UserItem not found");

            return Ok(item);
        }

         [HttpPost("purchase")]
        public async Task<ActionResult> PurchaseProduct([FromBody] Product product)
        {
            if (product == null)
                return BadRequest("Invalid product data");

            var existingItem = await context.userItems.FirstOrDefaultAsync(i => i.Name == product.Name);
            if (existingItem != null)
            {
                existingItem.Quantity += 1;
            }
            else
            {
                int newId = await context.userItems.CountAsync() + 1;
                var newItem = new UserItem
                {
                    Id = newId,
                    Name = product.Name,
                    type = product.type,
                    bonus = product.bonus,
                    Price = product.Price,
                    PrictureUrl = product.PrictureUrl,
                    Quantity = 1
                };
                context.userItems.Add(newItem);
            }

            await context.SaveChangesAsync();
            return Ok($"Product '{product.Name}' purchased successfully.");
        }
    }
}
