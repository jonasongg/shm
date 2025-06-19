using Microsoft.EntityFrameworkCore.Migrations;
using NodaTime;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SHM_MS.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "vms",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    name = table.Column<string>(type: "text", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vms", x => x.id);
                }
            );

            migrationBuilder.CreateTable(
                name: "reports",
                columns: table => new
                {
                    timestamp = table.Column<Instant>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    vm_id = table.Column<int>(type: "integer", nullable: false),
                    total_memory = table.Column<double>(type: "double precision", nullable: false),
                    free_memory = table.Column<double>(type: "double precision", nullable: false),
                    cpu_usage_percent = table.Column<double>(
                        type: "double precision",
                        nullable: false
                    ),
                    total_space = table.Column<double>(type: "double precision", nullable: false),
                    free_space = table.Column<double>(type: "double precision", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_reports", x => new { x.timestamp, x.vm_id });
                    table.ForeignKey(
                        name: "fk_reports_vms_vm_id",
                        column: x => x.vm_id,
                        principalTable: "vms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.Sql("SELECT create_hypertable('reports', by_range('timestamp'));");

            migrationBuilder.CreateIndex(
                name: "ix_reports_vm_id",
                table: "reports",
                column: "vm_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "reports");

            migrationBuilder.DropTable(name: "vms");
        }
    }
}
