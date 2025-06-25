using VMIS.Models;
using VMIS.Data;
using Microsoft.Data.SqlClient;
using Dapper;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace VMIS.Services
{
    public interface IAuthService
    {
        Task<AuthResult> RegisterAsync(RegisterRequest request);
        Task<AuthResult> LoginAsync(LoginRequest request);
    }

    public class AuthService : IAuthService
    {
        private readonly VMISContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(VMISContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResult> RegisterAsync(RegisterRequest request)
        {
            using var connection = _context.CreateConnection();

            // Check if user exists
            var existingUser = await connection.QueryFirstOrDefaultAsync<User>(
                "SELECT * FROM Users WHERE Email = @Email OR Username = @Username",
                new { request.Email, request.Username });

            if (existingUser != null)
            {
                return new AuthResult { Success = false, Message = "User already exists" };
            }

            // Hash password
            var passwordHash = HashPassword(request.Password);

            // Insert user
            var userId = await connection.QuerySingleAsync<int>(
                @"INSERT INTO Users (Username, Email, PasswordHash) 
                  OUTPUT INSERTED.Id 
                  VALUES (@Username, @Email, @PasswordHash)",
                new { request.Username, request.Email, PasswordHash = passwordHash });

            var user = new UserDto { Id = userId, Username = request.Username, Email = request.Email };
            var token = GenerateJwtToken(user);

            return new AuthResult 
            { 
                Success = true, 
                Token = token, 
                User = user,
                Message = "User created successfully" 
            };
        }

        public async Task<AuthResult> LoginAsync(LoginRequest request)
        {
            using var connection = _context.CreateConnection();

            var user = await connection.QueryFirstOrDefaultAsync<User>(
                "SELECT * FROM Users WHERE Email = @Email",
                new { request.Email });

            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                return new AuthResult { Success = false, Message = "Invalid credentials" };
            }

            var userDto = new UserDto { Id = user.Id, Username = user.Username, Email = user.Email };
            var token = GenerateJwtToken(userDto);

            return new AuthResult 
            { 
                Success = true, 
                Token = token, 
                User = userDto,
                Message = "Login successful" 
            };
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + "salt"));
            return Convert.ToBase64String(hashedBytes);
        }

        private bool VerifyPassword(string password, string hash)
        {
            var passwordHash = HashPassword(password);
            return passwordHash == hash;
        }

        private string GenerateJwtToken(UserDto user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("userId", user.Id.ToString()),
                    new Claim("username", user.Username)
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class AuthResult
    {
        public bool Success { get; set; }
        public string Token { get; set; }
        public UserDto User { get; set; }
        public string Message { get; set; }
    }
}