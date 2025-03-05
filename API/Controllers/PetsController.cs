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
            var now = DateTime.UtcNow;
            // Generate a Gaussian random number with mean 16 and standard deviation 2 using Box-Muller transform
            var rand = new Random();
            double u1 = 1.0 - rand.NextDouble(); // Uniform (0,1]
            double u2 = 1.0 - rand.NextDouble();
            double randStdNormal = Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2);
            double gaussian = 16 + 2 * randStdNormal; // Scale to desired mean and std deviation
            decimal deadAge = Convert.ToDecimal(gaussian);

            var pet = new Pet
            {
                Name = name,
                Hunger = 60,
                Mood = 60,
                IsHealthy = true,
                IsDead = false,
                Birthday = now,
                Last_feed = now,
                Last_play = now,
                Age = TimeSpan.Zero,
                DeadAge = deadAge
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

            return NoContent();
        }

        [HttpGet("alive")]
        public async Task<ActionResult<bool>> HasAlivePet()
        {
            bool hasAlive = await _context.Pets.AnyAsync(p => p.IsDead == false);
            return hasAlive;
        }

        [HttpGet("alive-pet")]
        public async Task<ActionResult<Pet>> GetAlivePet()
        {
            var pet = await _context.Pets.FirstOrDefaultAsync(p => p.IsDead == false);
            if (pet == null)
            {
                return NotFound();
            }
            return pet;
        }

        [HttpGet("{id}/calculate-age")]
        public async Task<ActionResult<decimal>> CalculateAge(int id)
        {
            var pet = await _context.Pets.FindAsync(id);
            if (pet == null)
            {
                return NotFound();
            }
            var now = DateTime.UtcNow;
            var minutesElapsed = (now - pet.Birthday).TotalMinutes;
            var calculatedAge = minutesElapsed * 0.13333;
            var roundedAge = Math.Round((decimal)calculatedAge, 1);
            return roundedAge;
        }

        [HttpGet("{id}/calculate-hunger")]
        public async Task<ActionResult<int>> CalculateHunger(int id)
        {
            var pet = await _context.Pets.FindAsync(id);
            if (pet == null)
            {
                return NotFound();
            }
            var now = DateTime.UtcNow;
            var minutesElapsed = (now - pet.Last_feed).TotalMinutes;
            var consumption = minutesElapsed * 0.0283;
            var newHunger = pet.Hunger - consumption;
            pet.Hunger = (int)Math.Round(newHunger, 0);
            pet.Last_feed = now;
            await _context.SaveChangesAsync();
            return pet.Hunger;
        }

        [HttpGet("{id}/calculate-mood")]
        public async Task<ActionResult<int>> CalculateMood(int id)
        {
            var pet = await _context.Pets.FindAsync(id);
            if (pet == null)
            {
                return NotFound();
            }
            var now = DateTime.UtcNow;
            var minutesElapsed = (now - pet.Last_play).TotalMinutes;
            var consumption = minutesElapsed * 0.0283;
            var newMood = pet.Mood - consumption;
            pet.Mood = (int)Math.Round(newMood, 0);
            pet.Last_play = now;
            await _context.SaveChangesAsync();
            return pet.Mood;
        }

        [HttpGet("{id}/calculate-healthy")]
        public async Task<ActionResult<bool>> CalculateHealthy(int id)
        {
            var pet = await _context.Pets.FindAsync(id);
            if (pet == null)
            {
                return NotFound();
            }
            bool isHealthy = pet.Hunger >= 30 && pet.Mood >= 30;
            pet.IsHealthy = isHealthy;
            await _context.SaveChangesAsync();
            return isHealthy;
        }
    }
}
