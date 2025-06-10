using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SHM_MS.Migrations
{
    /// <inheritdoc />
    public partial class AddDataRetentionPolicy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("SELECT add_retention_policy('reports', INTERVAL '24 hours');");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("SELECT remove_retention_policy('reports');");
        }
    }
}
