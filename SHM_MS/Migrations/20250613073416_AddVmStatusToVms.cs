using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SHM_MS.Migrations
{
    /// <inheritdoc />
    public partial class AddVmStatusToVms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "status",
                table: "vms",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "status",
                table: "vms");
        }
    }
}
