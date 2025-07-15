using Microsoft.EntityFrameworkCore.Migrations;
using NodaTime;

#nullable disable

namespace SHM_MS.Migrations
{
    /// <inheritdoc />
    public partial class AddSystemStatusHistoryTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "system_status_histories",
                columns: table => new
                {
                    timestamp = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_system_status_histories", x => x.timestamp);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "system_status_histories");
        }
    }
}
