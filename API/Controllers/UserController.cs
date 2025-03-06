using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(StoreContext context) : ControllerBase
    {
        [HttpGet("balance/{id}")]
        public async Task<ActionResult<int>> GetBalance(int id)
        {
            var user = await context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found");

            return Ok(user.Balance);
        }
        
        [HttpGet("name/{id}")]
        public async Task<ActionResult<string>> GetUserName(int id)
        {
            var user = await context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found");

            return Ok(user.Name);
        }

        [HttpPut("name/{id}")]
        public async Task<ActionResult> UpdateUserName(int id, [FromBody] string newName)
        {
            var user = await context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found");

            user.Name = newName;
            await context.SaveChangesAsync();
            return Ok("Username updated successfully");
        }

        [HttpPut("balance/increase/{id}")]
        public async Task<ActionResult> IncreaseBalance(int id, [FromBody] int amount)
        {
            if (amount <= 0) return BadRequest("Amount must be greater than zero");

            var user = await context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found");

            user.Balance += amount;
            await context.SaveChangesAsync();
            return Ok($"Balance increased by {amount}. New balance: {user.Balance}");
        }

        [HttpPut("balance/decrease/{id}")]
        public async Task<ActionResult> DecreaseBalance(int id, [FromBody] int amount)
        {
            if (amount <= 0) return BadRequest("Amount must be greater than zero");

            var user = await context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found");

            if (user.Balance < amount) return BadRequest("Insufficient balance");

            user.Balance -= amount;
            await context.SaveChangesAsync();
            return Ok($"Balance decreased by {amount}. New balance: {user.Balance}");
        }

        [HttpDelete("consume/{id}")]
        public async Task<IActionResult> ConsumeItem(int id)
        {
            // 使用 FirstOrDefaultAsync 确保能正确获取
            var item = await context.userItems.FirstOrDefaultAsync(i => i.Id == id);
            if (item == null)
            {
                return NotFound("Item not found");
            }

            if (item.Quantity > 1)
            {
                item.Quantity -= 1;
            }
            else
            {
                context.userItems.Remove(item);
                context.Entry(item).State = EntityState.Deleted;
            }

            await context.SaveChangesAsync();
            return Ok("Item consumed successfully.");
        }
    }
}
