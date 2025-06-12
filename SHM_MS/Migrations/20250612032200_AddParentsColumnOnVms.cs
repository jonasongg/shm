using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SHM_MS.Migrations
{
    /// <inheritdoc />
    public partial class AddParentsColumnOnVms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "vm_vm",
                columns: table => new
                {
                    dependants_id = table.Column<int>(type: "integer", nullable: false),
                    dependent_ons_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vm_vm", x => new { x.dependants_id, x.dependent_ons_id });
                    table.ForeignKey(
                        name: "fk_vm_vm_vms_dependants_id",
                        column: x => x.dependants_id,
                        principalTable: "vms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_vm_vm_vms_dependent_ons_id",
                        column: x => x.dependent_ons_id,
                        principalTable: "vms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_vm_vm_dependent_ons_id",
                table: "vm_vm",
                column: "dependent_ons_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "vm_vm");
        }
    }
}
