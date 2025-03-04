using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PetsController : ControllerBase
    {
        private readonly StoreContext _context;

        public PetsController(StoreContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<Pet>>> GetPets()
        {
            return await _context.Pets.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Pet>> GetPet(int id)
        {
            var pet = await _context.Pets.FindAsync(id);
            if (pet == null) return NotFound();
            return pet;
        }

        [HttpPost]
        public async Task<ActionResult<Pet>> CreatePet([FromBody] string name)
        {
            var pet = new Pet
            {
                Name = name,
                Level = 0,
                Exp = 0,
                Hunger = 60,
                Mood = 60,
                IsHealthy = true,
                IsDead = false,
                Birthday = DateTime.UtcNow,
                Age = TimeSpan.Zero
            };

            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPet), new { id = pet.Id }, pet);
        }


        [HttpPut("{id}/mark-dead")]
        public async Task<IActionResult> MarkPetAsDead(int id)
        {
            var pet = await _context.Pets.FindAsync(id);
            if (pet == null) return NotFound();

            pet.IsDead = true;
            await _context.SaveChangesAsync();

            return NoContent(); // 204 No Content
        }

        
    }
}
