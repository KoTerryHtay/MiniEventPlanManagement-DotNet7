using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

namespace MiniEventPlanManagement.Database.Models;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<TblEvent> TblEvents { get; set; }

    public virtual DbSet<TblGuest> TblGuests { get; set; }

    public virtual DbSet<TblGuestAssignment> TblGuestAssignments { get; set; }

    public virtual DbSet<TblTable> TblTables { get; set; }

    public virtual DbSet<TblUser> TblUsers { get; set; }

    //#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.

    //protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    //    => optionsBuilder.UseSqlServer("Server=LAPTOP-0NOHR6LI;Database=EventPlanManagement;User Id=sa;Password=sasa@123;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TblEvent>(entity =>
        {
            entity.ToTable("Tbl_Event");

            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.EventDate).HasColumnType("datetime");
            entity.Property(e => e.Name).HasMaxLength(50);

            entity.HasOne(d => d.User).WithMany(p => p.TblEvents)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tbl_Event_Tbl_User");
        });

        modelBuilder.Entity<TblGuest>(entity =>
        {
            entity.ToTable("Tbl_Guest");

            entity.Property(e => e.FullName).HasMaxLength(50);
            entity.Property(e => e.Phone).HasMaxLength(50);
        });

        modelBuilder.Entity<TblGuestAssignment>(entity =>
        {
            entity.ToTable("Tbl_GuestAssignment");

            entity.HasIndex(e => new { e.EventId, e.TableId, e.GuestId }, "IX_Tbl_GuestAssignment").IsUnique();

            entity.Property(e => e.CheckedInAt).HasColumnType("datetime");
            entity.Property(e => e.RsvpStatus)
                .HasMaxLength(10)
                .HasDefaultValueSql("(N'Pending')")
                .IsFixedLength();

            entity.HasOne(d => d.Event).WithMany(p => p.TblGuestAssignments)
                .HasForeignKey(d => d.EventId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tbl_GuestAssignment_Tbl_Event");

            entity.HasOne(d => d.Guest).WithMany(p => p.TblGuestAssignments)
                .HasForeignKey(d => d.GuestId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tbl_GuestAssignment_Tbl_Guest");

            entity.HasOne(d => d.Table).WithMany(p => p.TblGuestAssignments)
                .HasForeignKey(d => d.TableId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tbl_GuestAssignment_Tbl_Table");
        });

        modelBuilder.Entity<TblTable>(entity =>
        {
            entity.ToTable("Tbl_Table");

            entity.Property(e => e.Capacity).HasDefaultValueSql("((4))");
            entity.Property(e => e.Name).HasMaxLength(50);

            entity.HasOne(d => d.Event).WithMany(p => p.TblTables)
                .HasForeignKey(d => d.EventId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tbl_Table_Tbl_Event");
        });

        modelBuilder.Entity<TblUser>(entity =>
        {
            entity.ToTable("Tbl_User");

            entity.HasIndex(e => e.Email, "IX_Tbl_User").IsUnique();

            entity.Property(e => e.Email).HasMaxLength(50);
            entity.Property(e => e.Name).HasMaxLength(50);
            entity.Property(e => e.Password).HasMaxLength(50);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
