using Microsoft.AspNetCore.Mvc;
using VMIS.Models;
using VMIS.Services;

namespace VMIS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest(new { error = "All fields are required" });
                }

                var result = await _authService.RegisterAsync(request);
                
                if (!result.Success)
                {
                    return BadRequest(new { error = result.Message });
                }

                return Ok(new 
                { 
                    message = result.Message,
                    token = result.Token,
                    user = result.User
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest(new { error = "Email and password are required" });
                }

                var result = await _authService.LoginAsync(request);
                
                if (!result.Success)
                {
                    return Unauthorized(new { error = result.Message });
                }

                return Ok(new 
                { 
                    message = result.Message,
                    token = result.Token,
                    user = result.User
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("test-register")]
        public IActionResult TestRegister([FromBody] RegisterRequest request)
        {
            try
            {
                // For testing - just return success without saving to database
                var testUser = new UserDto 
                { 
                    Id = 999, 
                    Username = request.Username, 
                    Email = request.Email 
                };
                
                var testToken = "test-token-" + DateTime.UtcNow.Ticks;
                
                return Ok(new 
                { 
                    message = "Test registration successful",
                    token = testToken,
                    user = testUser
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "Internal server error during test" });
            }
        }
    }
}