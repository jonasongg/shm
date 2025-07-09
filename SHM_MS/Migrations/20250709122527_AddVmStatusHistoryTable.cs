using Microsoft.EntityFrameworkCore.Migrations;
using NodaTime;

#nullable disable

namespace SHM_MS.Migrations
{
    /// <inheritdoc />
    public partial class AddVmStatusHistoryTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "vm_status_histories",
                columns: table => new
                {
                    timestamp = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    vm_id = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vm_status_histories", x => new { x.timestamp, x.vm_id });
                    table.ForeignKey(
                        name: "fk_vm_status_histories_vms_vm_id",
                        column: x => x.vm_id,
                        principalTable: "vms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_vm_status_histories_vm_id",
                table: "vm_status_histories",
                column: "vm_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "vm_status_histories");
        }
    }
}
