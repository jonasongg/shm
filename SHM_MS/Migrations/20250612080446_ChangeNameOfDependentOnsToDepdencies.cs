using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SHM_MS.Migrations
{
    /// <inheritdoc />
    public partial class ChangeNameOfDependentOnsToDepdencies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_vm_vm_vms_dependent_ons_id",
                table: "vm_vm");

            migrationBuilder.RenameColumn(
                name: "dependent_ons_id",
                table: "vm_vm",
                newName: "dependencies_id");

            migrationBuilder.RenameIndex(
                name: "ix_vm_vm_dependent_ons_id",
                table: "vm_vm",
                newName: "ix_vm_vm_dependencies_id");

            migrationBuilder.AddForeignKey(
                name: "fk_vm_vm_vms_dependencies_id",
                table: "vm_vm",
                column: "dependencies_id",
                principalTable: "vms",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_vm_vm_vms_dependencies_id",
                table: "vm_vm");

            migrationBuilder.RenameColumn(
                name: "dependencies_id",
                table: "vm_vm",
                newName: "dependent_ons_id");

            migrationBuilder.RenameIndex(
                name: "ix_vm_vm_dependencies_id",
                table: "vm_vm",
                newName: "ix_vm_vm_dependent_ons_id");

            migrationBuilder.AddForeignKey(
                name: "fk_vm_vm_vms_dependent_ons_id",
                table: "vm_vm",
                column: "dependent_ons_id",
                principalTable: "vms",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
