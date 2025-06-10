using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SHM_MS.Migrations
{
    /// <inheritdoc />
    public partial class CreateIndexForVmIdAndTimestampOnReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "ix_reports_vm_id_timestamp",
                table: "reports",
                columns: ["vm_id", "timestamp"],
                descending: [false, true]
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(name: "ix_reports_vm_id_timestamp", table: "reports");
        }
    }
}
