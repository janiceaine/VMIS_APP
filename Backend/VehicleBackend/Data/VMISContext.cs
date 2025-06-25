using Microsoft.Data.SqlClient;
using System.Data;

namespace VMIS.Data
{
    public class VMISContext
    {
        private readonly string _connectionString;

        public VMISContext(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public SqlConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }
    }
}