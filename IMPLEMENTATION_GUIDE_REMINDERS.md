# 📋 Implementation Guide: Reminders Feature (First Priority)

> This document provides step-by-step implementation for the **Reminders feature** - the #1 missing functionality in your Fundoo Notes app.

---

## Table of Contents
1. [Database Schema](#database-schema)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Integration Steps](#integration-steps)
5. [Testing Strategy](#testing-strategy)

---

## Database Schema

### Step 1: Create Reminder Entity

**File**: `Backend/DataBaseLayer/Entities/Reminder.cs`

```csharp
using System;

namespace DataBaseLayer.Entities
{
    public class Reminder
    {
        public int Id { get; set; }
        
        // Foreign Key
        public int NoteId { get; set; }
        
        // Reminder Details
        public DateTime ReminderDateTime { get; set; }
        
        // Recurrence
        public bool IsRecurring { get; set; }
        public string? RecurrencePattern { get; set; } // "DAILY", "WEEKLY", "MONTHLY"
        
        // Status
        public bool IsNotified { get; set; }
        public bool IsActive { get; set; }
        
        // Timestamps
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? NotifiedAt { get; set; }
        
        // Navigation Properties
        public Note Note { get; set; } = null!;
    }
}
```

### Step 2: Update Note Entity

**File**: `Backend/DataBaseLayer/Entities/Note.cs`

Add this navigation property to existing Note class:

```csharp
// Add to existing Note class
public ICollection<Reminder> Reminders { get; set; } = new HashSet<Reminder>();
```

### Step 3: Create EF Core Configuration

**File**: `Backend/DataBaseLayer/Configurations/ReminderConfiguration.cs`

```csharp
using DataBaseLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataBaseLayer.Configurations
{
    public class ReminderConfiguration : IEntityTypeConfiguration<Reminder>
    {
        public void Configure(EntityTypeBuilder<Reminder> builder)
        {
            builder.HasKey(r => r.Id);

            builder.Property(r => r.ReminderDateTime)
                .IsRequired();

            builder.Property(r => r.IsRecurring)
                .HasDefaultValue(false);

            builder.Property(r => r.IsNotified)
                .HasDefaultValue(false);

            builder.Property(r => r.IsActive)
                .HasDefaultValue(true);

            builder.Property(r => r.CreatedAt)
                .IsRequired();

            // Foreign Key
            builder.HasOne(r => r.Note)
                .WithMany(n => n.Reminders)
                .HasForeignKey(r => r.NoteId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes
            builder.HasIndex(r => r.NoteId);
            builder.HasIndex(r => r.ReminderDateTime);
            builder.HasIndex(r => new { r.IsActive, r.IsNotified });
        }
    }
}
```

### Step 4: Add Configuration to DbContext

**File**: `Backend/DataBaseLayer/Context/FundooAppDbContext.cs`

```csharp
// Add this inside OnModelCreating method
modelBuilder.ApplyConfiguration(new ReminderConfiguration());
```

### Step 5: Create EF Core Migration

```bash
cd Backend/DataBaseLayer
dotnet ef migrations add AddReminderFeature
dotnet ef database update
```

---

## Backend Implementation

### Step 1: Create Repository Interface

**File**: `Backend/DataBaseLayer/Interfaces/IReminderRepository.cs`

```csharp
using DataBaseLayer.Entities;

namespace DataBaseLayer.Interfaces
{
    public interface IReminderRepository
    {
        // CRUD Operations
        Task<Reminder?> GetByIdAsync(int id);
        Task<IEnumerable<Reminder>> GetByNoteIdAsync(int noteId);
        Task<IEnumerable<Reminder>> GetByUserIdAsync(int userId);
        
        // Specific Queries
        Task<IEnumerable<Reminder>> GetActiveRemindersAsync();
        Task<IEnumerable<Reminder>> GetDueRemindersAsync(DateTime uptoTime);
        Task<IEnumerable<Reminder>> GetUpcomingRemindersAsync(int userId, int daysAhead = 7);
        
        // Modification
        Task AddAsync(Reminder reminder);
        Task UpdateAsync(Reminder reminder);
        Task DeleteAsync(Reminder reminder);
        Task DeleteByNoteIdAsync(int noteId);
        
        // Save
        Task SaveAsync();
    }
}
```

### Step 2: Create Repository Implementation

**File**: `Backend/DataBaseLayer/Repositories/ReminderRepository.cs`

```csharp
using DataBaseLayer.Context;
using DataBaseLayer.Entities;
using DataBaseLayer.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DataBaseLayer.Repositories
{
    public class ReminderRepository : IReminderRepository
    {
        private readonly FundooAppDbContext _context;

        public ReminderRepository(FundooAppDbContext context)
        {
            _context = context;
        }

        public async Task<Reminder?> GetByIdAsync(int id)
        {
            return await _context.Reminders
                .Include(r => r.Note)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Reminder>> GetByNoteIdAsync(int noteId)
        {
            return await _context.Reminders
                .Where(r => r.NoteId == noteId)
                .OrderBy(r => r.ReminderDateTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reminder>> GetByUserIdAsync(int userId)
        {
            return await _context.Reminders
                .Include(r => r.Note)
                .Where(r => r.Note.UserId == userId && r.IsActive)
                .OrderBy(r => r.ReminderDateTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reminder>> GetActiveRemindersAsync()
        {
            return await _context.Reminders
                .Where(r => r.IsActive)
                .Include(r => r.Note)
                .ThenInclude(n => n.User)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reminder>> GetDueRemindersAsync(DateTime uptoTime)
        {
            return await _context.Reminders
                .Where(r => r.IsActive && 
                           r.IsNotified == false && 
                           r.ReminderDateTime <= uptoTime)
                .Include(r => r.Note)
                .ThenInclude(n => n.User)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reminder>> GetUpcomingRemindersAsync(int userId, int daysAhead = 7)
        {
            var startDate = DateTime.UtcNow;
            var endDate = startDate.AddDays(daysAhead);

            return await _context.Reminders
                .Include(r => r.Note)
                .Where(r => r.Note.UserId == userId &&
                           r.IsActive &&
                           r.ReminderDateTime >= startDate &&
                           r.ReminderDateTime <= endDate)
                .OrderBy(r => r.ReminderDateTime)
                .ToListAsync();
        }

        public async Task AddAsync(Reminder reminder)
        {
            await _context.Reminders.AddAsync(reminder);
        }

        public async Task UpdateAsync(Reminder reminder)
        {
            _context.Reminders.Update(reminder);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(Reminder reminder)
        {
            _context.Reminders.Remove(reminder);
            await Task.CompletedTask;
        }

        public async Task DeleteByNoteIdAsync(int noteId)
        {
            var reminders = await _context.Reminders
                .Where(r => r.NoteId == noteId)
                .ToListAsync();

            _context.Reminders.RemoveRange(reminders);
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
```

### Step 3: Create Service Interface

**File**: `Backend/BusinessLayer/Interfaces/Services/IReminderService.cs`

```csharp
using ModelLayer.DTOs.Reminders;

namespace BusinessLayer.Interfaces.Services
{
    public interface IReminderService
    {
        // CRUD Operations
        Task<ReminderResponseDto?> GetByIdAsync(int reminderId, int userId);
        Task<IEnumerable<ReminderResponseDto>> GetByNoteIdAsync(int noteId, int userId);
        Task<IEnumerable<ReminderResponseDto>> GetUpcomingAsync(int userId);
        
        // Create/Update
        Task<ReminderResponseDto> CreateAsync(CreateReminderDto dto, int userId);
        Task<ReminderResponseDto> UpdateAsync(int reminderId, UpdateReminderDto dto, int userId);
        
        // Delete
        Task DeleteAsync(int reminderId, int userId);
        
        // Special Operations
        Task<IEnumerable<ReminderResponseDto>> GetRemindersDueAsync();
        Task MarkAsNotifiedAsync(int reminderId);
    }
}
```

### Step 4: Create Service Implementation

**File**: `Backend/BusinessLayer/Services/ReminderService.cs`

```csharp
using BusinessLayer.Exceptions;
using BusinessLayer.Interfaces.Services;
using DataBaseLayer.Entities;
using DataBaseLayer.Interfaces;
using ModelLayer.DTOs.Reminders;

namespace BusinessLayer.Services
{
    public class ReminderService : IReminderService
    {
        private readonly IReminderRepository _reminderRepository;
        private readonly INoteRepository _noteRepository;

        public ReminderService(
            IReminderRepository reminderRepository,
            INoteRepository noteRepository)
        {
            _reminderRepository = reminderRepository;
            _noteRepository = noteRepository;
        }

        public async Task<ReminderResponseDto?> GetByIdAsync(int reminderId, int userId)
        {
            var reminder = await _reminderRepository.GetByIdAsync(reminderId);

            if (reminder == null)
                return null;

            // Check if user owns the note
            if (reminder.Note.UserId != userId)
                throw new UnauthorizedException("Access denied to this reminder");

            return MapToDto(reminder);
        }

        public async Task<IEnumerable<ReminderResponseDto>> GetByNoteIdAsync(int noteId, int userId)
        {
            var note = await _noteRepository.GetByIdAsync(noteId)
                ?? throw new NotFoundException("Note not found");

            if (note.UserId != userId)
                throw new UnauthorizedException("Access denied to this note");

            var reminders = await _reminderRepository.GetByNoteIdAsync(noteId);
            return reminders.Select(MapToDto);
        }

        public async Task<IEnumerable<ReminderResponseDto>> GetUpcomingAsync(int userId)
        {
            var reminders = await _reminderRepository.GetUpcomingRemindersAsync(userId, daysAhead: 7);
            return reminders.Select(MapToDto);
        }

        public async Task<ReminderResponseDto> CreateAsync(CreateReminderDto dto, int userId)
        {
            // Validate note exists and user owns it
            var note = await _noteRepository.GetByIdAsync(dto.NoteId)
                ?? throw new NotFoundException("Note not found");

            if (note.UserId != userId)
                throw new UnauthorizedException("You don't have permission to add reminders to this note");

            // Validate reminder date is in future
            if (dto.ReminderDateTime <= DateTime.UtcNow)
                throw new ValidationException("Reminder date/time must be in the future");

            // Validate recurrence pattern if recurring
            if (dto.IsRecurring && !ValidateRecurrencePattern(dto.RecurrencePattern))
                throw new ValidationException("Invalid recurrence pattern");

            var reminder = new Reminder
            {
                NoteId = dto.NoteId,
                ReminderDateTime = dto.ReminderDateTime,
                IsRecurring = dto.IsRecurring,
                RecurrencePattern = dto.RecurrencePattern,
                IsNotified = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _reminderRepository.AddAsync(reminder);
            await _reminderRepository.SaveAsync();

            return MapToDto(reminder);
        }

        public async Task<ReminderResponseDto> UpdateAsync(int reminderId, UpdateReminderDto dto, int userId)
        {
            var reminder = await _reminderRepository.GetByIdAsync(reminderId)
                ?? throw new NotFoundException("Reminder not found");

            if (reminder.Note.UserId != userId)
                throw new UnauthorizedException("You don't have permission to update this reminder");

            // Update datetime if provided
            if (dto.ReminderDateTime.HasValue)
            {
                if (dto.ReminderDateTime.Value <= DateTime.UtcNow)
                    throw new ValidationException("Reminder date/time must be in the future");

                reminder.ReminderDateTime = dto.ReminderDateTime.Value;
            }

            // Update recurrence if provided
            if (dto.IsRecurring.HasValue)
            {
                reminder.IsRecurring = dto.IsRecurring.Value;
                if (dto.IsRecurring.Value && !ValidateRecurrencePattern(dto.RecurrencePattern))
                    throw new ValidationException("Invalid recurrence pattern");
                reminder.RecurrencePattern = dto.RecurrencePattern;
            }

            reminder.UpdatedAt = DateTime.UtcNow;

            await _reminderRepository.UpdateAsync(reminder);
            await _reminderRepository.SaveAsync();

            return MapToDto(reminder);
        }

        public async Task DeleteAsync(int reminderId, int userId)
        {
            var reminder = await _reminderRepository.GetByIdAsync(reminderId)
                ?? throw new NotFoundException("Reminder not found");

            if (reminder.Note.UserId != userId)
                throw new UnauthorizedException("You don't have permission to delete this reminder");

            await _reminderRepository.DeleteAsync(reminder);
            await _reminderRepository.SaveAsync();
        }

        public async Task<IEnumerable<ReminderResponseDto>> GetRemindersDueAsync()
        {
            // Get reminders that are due (used by background job)
            var reminders = await _reminderRepository.GetDueRemindersAsync(DateTime.UtcNow);
            return reminders.Select(MapToDto);
        }

        public async Task MarkAsNotifiedAsync(int reminderId)
        {
            var reminder = await _reminderRepository.GetByIdAsync(reminderId);
            if (reminder != null)
            {
                reminder.IsNotified = true;
                reminder.NotifiedAt = DateTime.UtcNow;

                // If not recurring, deactivate
                if (!reminder.IsRecurring)
                {
                    reminder.IsActive = false;
                }
                else
                {
                    // Recalculate next reminder datetime
                    reminder.ReminderDateTime = CalculateNextReminderDateTime(
                        reminder.ReminderDateTime,
                        reminder.RecurrencePattern);
                    reminder.IsNotified = false;
                }

                await _reminderRepository.UpdateAsync(reminder);
                await _reminderRepository.SaveAsync();
            }
        }

        // Helper Methods
        private ReminderResponseDto MapToDto(Reminder reminder)
        {
            return new ReminderResponseDto
            {
                Id = reminder.Id,
                NoteId = reminder.NoteId,
                ReminderDateTime = reminder.ReminderDateTime,
                IsRecurring = reminder.IsRecurring,
                RecurrencePattern = reminder.RecurrencePattern,
                IsNotified = reminder.IsNotified,
                IsActive = reminder.IsActive,
                CreatedAt = reminder.CreatedAt,
                UpdatedAt = reminder.UpdatedAt
            };
        }

        private bool ValidateRecurrencePattern(string? pattern)
        {
            if (string.IsNullOrEmpty(pattern))
                return false;

            var validPatterns = new[] { "DAILY", "WEEKLY", "MONTHLY", "YEARLY" };
            return validPatterns.Contains(pattern.ToUpper());
        }

        private DateTime CalculateNextReminderDateTime(DateTime currentDateTime, string? pattern)
        {
            return pattern?.ToUpper() switch
            {
                "DAILY" => currentDateTime.AddDays(1),
                "WEEKLY" => currentDateTime.AddDays(7),
                "MONTHLY" => currentDateTime.AddMonths(1),
                "YEARLY" => currentDateTime.AddYears(1),
                _ => currentDateTime
            };
        }
    }
}
```

### Step 5: Create DTOs

**File**: `Backend/ModelLayer/DTOs/Reminders/CreateReminderDto.cs`

```csharp
namespace ModelLayer.DTOs.Reminders
{
    public class CreateReminderDto
    {
        public int NoteId { get; set; }
        public DateTime ReminderDateTime { get; set; }
        public bool IsRecurring { get; set; }
        public string? RecurrencePattern { get; set; } // "DAILY", "WEEKLY", "MONTHLY"
    }
}
```

**File**: `Backend/ModelLayer/DTOs/Reminders/UpdateReminderDto.cs`

```csharp
namespace ModelLayer.DTOs.Reminders
{
    public class UpdateReminderDto
    {
        public DateTime? ReminderDateTime { get; set; }
        public bool? IsRecurring { get; set; }
        public string? RecurrencePattern { get; set; }
    }
}
```

**File**: `Backend/ModelLayer/DTOs/Reminders/ReminderResponseDto.cs`

```csharp
namespace ModelLayer.DTOs.Reminders
{
    public class ReminderResponseDto
    {
        public int Id { get; set; }
        public int NoteId { get; set; }
        public DateTime ReminderDateTime { get; set; }
        public bool IsRecurring { get; set; }
        public string? RecurrencePattern { get; set; }
        public bool IsNotified { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
```

### Step 6: Register Services in Program.cs

**File**: `Backend/FundooNotes/Program.cs`

Add these lines after existing repository registrations:

```csharp
// ========================================
// 3. REPOSITORY REGISTRATION
// ========================================
builder.Services.AddScoped<IReminderRepository, ReminderRepository>(); // ADD THIS

// ========================================
// 4. SERVICE REGISTRATION
// ========================================
builder.Services.AddScoped<IReminderService, ReminderService>(); // ADD THIS
```

### Step 7: Create Controller

**File**: `Backend/FundooNotes/Controllers/RemindersController.cs`

```csharp
using BusinessLayer.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ModelLayer.DTOs.Reminders;
using ModelLayer.Responses;

namespace FundooNotes.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class RemindersController : ControllerBase
    {
        private readonly IReminderService _reminderService;
        private readonly ILogger<RemindersController> _logger;

        public RemindersController(
            IReminderService reminderService,
            ILogger<RemindersController> logger)
        {
            _reminderService = reminderService;
            _logger = logger;
        }

        /// Get reminders for a note
        [HttpGet("note/{noteId}")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<ReminderResponseDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetByNoteId(int noteId)
        {
            var userId = GetUserId();
            _logger.LogInformation("Fetching reminders for note {NoteId}", noteId);

            var reminders = await _reminderService.GetByNoteIdAsync(noteId, userId);

            return Ok(ApiResponse<IEnumerable<ReminderResponseDto>>.SuccessResponse(
                reminders, "Reminders retrieved successfully"));
        }

        /// Get upcoming reminders
        [HttpGet("upcoming")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<ReminderResponseDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUpcoming()
        {
            var userId = GetUserId();
            _logger.LogInformation("Fetching upcoming reminders for user {UserId}", userId);

            var reminders = await _reminderService.GetUpcomingAsync(userId);

            return Ok(ApiResponse<IEnumerable<ReminderResponseDto>>.SuccessResponse(
                reminders, "Upcoming reminders retrieved successfully"));
        }

        /// Create a reminder
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<ReminderResponseDto>), StatusCodes.Status201Created)]
        public async Task<IActionResult> Create([FromBody] CreateReminderDto dto)
        {
            var userId = GetUserId();
            _logger.LogInformation("Creating reminder for note {NoteId}", dto.NoteId);

            var reminder = await _reminderService.CreateAsync(dto, userId);

            return StatusCode(StatusCodes.Status201Created,
                ApiResponse<ReminderResponseDto>.SuccessResponse(reminder, "Reminder created successfully"));
        }

        /// Update a reminder
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<ReminderResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateReminderDto dto)
        {
            var userId = GetUserId();
            _logger.LogInformation("Updating reminder {ReminderId}", id);

            var reminder = await _reminderService.UpdateAsync(id, dto, userId);

            return Ok(ApiResponse<ReminderResponseDto>.SuccessResponse(reminder, "Reminder updated successfully"));
        }

        /// Delete a reminder
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetUserId();
            _logger.LogInformation("Deleting reminder {ReminderId}", id);

            await _reminderService.DeleteAsync(id, userId);

            return Ok(ApiResponse.SuccessResponse("Reminder deleted successfully"));
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim ?? "0");
        }
    }
}
```

---

## Frontend Implementation

### Step 1: Create Reminder Model

**File**: `Frontend/src/app/core/models/reminder.model.ts`

```typescript
export interface Reminder {
  id: number;
  noteId: number;
  reminderDateTime: Date;
  isRecurring: boolean;
  recurrencePattern?: string; // "DAILY", "WEEKLY", "MONTHLY", "YEARLY"
  isNotified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateReminderDto {
  noteId: number;
  reminderDateTime: Date;
  isRecurring: boolean;
  recurrencePattern?: string;
}

export interface UpdateReminderDto {
  reminderDateTime?: Date;
  isRecurring?: boolean;
  recurrencePattern?: string;
}
```

### Step 2: Create Reminder Service

**File**: `Frontend/src/app/core/services/reminder.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, catchError } from 'rxjs';
import { Reminder, CreateReminderDto, UpdateReminderDto, ApiResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private apiUrl = `${environment.apiUrl}/api/reminders`;

  private remindersSubject = new BehaviorSubject<Reminder[]>([]);
  public reminders$ = this.remindersSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get reminders for a note
  getRemindersByNoteId(noteId: number): Observable<Reminder[]> {
    return this.http.get<ApiResponse<Reminder[]>>(`${this.apiUrl}/note/${noteId}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Get upcoming reminders
  getUpcomingReminders(): Observable<Reminder[]> {
    return this.http.get<ApiResponse<Reminder[]>>(`${this.apiUrl}/upcoming`)
      .pipe(
        map(response => response.data),
        tap(reminders => this.remindersSubject.next(reminders)),
        catchError(this.handleError)
      );
  }

  // Create reminder
  createReminder(dto: CreateReminderDto): Observable<Reminder> {
    return this.http.post<ApiResponse<Reminder>>(this.apiUrl, dto)
      .pipe(
        map(response => response.data),
        tap(reminder => {
          const current = this.remindersSubject.value;
          this.remindersSubject.next([...current, reminder]);
        }),
        catchError(this.handleError)
      );
  }

  // Update reminder
  updateReminder(id: number, dto: UpdateReminderDto): Observable<Reminder> {
    return this.http.put<ApiResponse<Reminder>>(`${this.apiUrl}/${id}`, dto)
      .pipe(
        map(response => response.data),
        tap(updatedReminder => {
          const current = this.remindersSubject.value.map(r =>
            r.id === id ? updatedReminder : r
          );
          this.remindersSubject.next(current);
        }),
        catchError(this.handleError)
      );
  }

  // Delete reminder
  deleteReminder(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => void 0),
        tap(() => {
          const current = this.remindersSubject.value.filter(r => r.id !== id);
          this.remindersSubject.next(current);
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('Reminder API Error:', error);
    throw error;
  }
}
```

### Step 3: Create Reminder Picker Component

**File**: `Frontend/src/app/shared/components/reminder-picker/reminder-picker.component.ts`

```typescript
import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reminder } from '../../../core/models/reminder.model';

@Component({
  selector: 'app-reminder-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reminder-picker">
      <div class="reminder-header">
        <h4>Set Reminder</h4>
        <button class="close-btn" (click)="onClose()">×</button>
      </div>

      <div class="reminder-body">
        <!-- Date Picker -->
        <div class="form-group">
          <label>Date</label>
          <input 
            type="date" 
            [(ngModel)]="selectedDate"
            [min]="todayDate"
            class="form-control"
          />
        </div>

        <!-- Time Picker -->
        <div class="form-group">
          <label>Time</label>
          <input 
            type="time" 
            [(ngModel)]="selectedTime"
            class="form-control"
          />
        </div>

        <!-- Recurrence -->
        <div class="form-group">
          <label>
            <input 
              type="checkbox" 
              [(ngModel)]="isRecurring"
              (change)="onRecurringChange()"
            />
            Repeat
          </label>
        </div>

        <!-- Recurrence Pattern -->
        <div class="form-group" *ngIf="isRecurring">
          <label>Pattern</label>
          <select [(ngModel)]="recurrencePattern" class="form-control">
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>

        <!-- Preset Options -->
        <div class="preset-options">
          <button (click)="setQuickReminder('TOMORROW_9AM')" class="preset-btn">
            Tomorrow 9 AM
          </button>
          <button (click)="setQuickReminder('IN_1_HOUR')" class="preset-btn">
            In 1 hour
          </button>
          <button (click)="setQuickReminder('IN_1_DAY')" class="preset-btn">
            In 1 day
          </button>
          <button (click)="setQuickReminder('NEXT_WEEK')" class="preset-btn">
            Next week
          </button>
        </div>
      </div>

      <div class="reminder-footer">
        <button (click)="onCancel()" class="btn-cancel">Cancel</button>
        <button (click)="onSave()" class="btn-save" [disabled]="!isValid()">
          Save Reminder
        </button>
      </div>
    </div>
  `,
  styles: [`
    .reminder-picker {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      max-width: 400px;
      padding: 0;
    }

    .reminder-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .reminder-body {
      padding: 16px;
      max-height: 400px;
      overflow-y: auto;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .preset-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 16px 0;
    }

    .preset-btn {
      padding: 8px;
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }

    .preset-btn:hover {
      background: #e8e8e8;
    }

    .reminder-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .btn-cancel, .btn-save {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-cancel {
      background: #f5f5f5;
    }

    .btn-save {
      background: #1976d2;
      color: white;
    }

    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
    }
  `]
})
export class ReminderPickerComponent {
  @Input() reminder?: Reminder;
  @Output() reminderSaved = new EventEmitter<CreateReminderDto>();
  @Output() cancelled = new EventEmitter<void>();

  selectedDate = signal('');
  selectedTime = signal('09:00');
  isRecurring = signal(false);
  recurrencePattern = signal('');
  todayDate = new Date().toISOString().split('T')[0];

  ngOnInit() {
    if (this.reminder) {
      const date = new Date(this.reminder.reminderDateTime);
      this.selectedDate.set(date.toISOString().split('T')[0]);
      this.selectedTime.set(date.toTimeString().slice(0, 5));
      this.isRecurring.set(this.reminder.isRecurring);
      this.recurrencePattern.set(this.reminder.recurrencePattern || '');
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.selectedDate.set(tomorrow.toISOString().split('T')[0]);
    }
  }

  onRecurringChange() {
    if (!this.isRecurring()) {
      this.recurrencePattern.set('');
    }
  }

  setQuickReminder(type: string) {
    const now = new Date();
    let targetDate: Date;

    switch (type) {
      case 'TOMORROW_9AM':
        targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + 1);
        targetDate.setHours(9, 0, 0, 0);
        break;
      case 'IN_1_HOUR':
        targetDate = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case 'IN_1_DAY':
        targetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'NEXT_WEEK':
        targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + 7);
        break;
      default:
        return;
    }

    this.selectedDate.set(targetDate.toISOString().split('T')[0]);
    this.selectedTime.set(targetDate.toTimeString().slice(0, 5));
  }

  isValid(): boolean {
    return !!this.selectedDate() && !!this.selectedTime() &&
      (!this.isRecurring() || !!this.recurrencePattern());
  }

  onSave() {
    if (!this.isValid()) return;

    const dateTime = `${this.selectedDate()}T${this.selectedTime()}`;
    const reminderDateTime = new Date(dateTime);

    const dto: CreateReminderDto = {
      noteId: 0, // Will be set by parent
      reminderDateTime,
      isRecurring: this.isRecurring(),
      recurrencePattern: this.recurrencePattern()
    };

    this.reminderSaved.emit(dto);
  }

  onCancel() {
    this.cancelled.emit();
  }

  onClose() {
    this.cancelled.emit();
  }
}
```

### Step 4: Update Note Card Component

Add reminder button to existing note-card.ts. Add this to the template:

```typescript
<!-- Add to note-card.html -->
<button class="action-btn" (click)="toggleReminderPicker()" title="Add reminder">
  🔔
</button>
```

Add this to note-card.ts:

```typescript
showReminderPicker = signal(false);
private reminderService = inject(ReminderService);

toggleReminderPicker(event: Event): void {
  event.stopPropagation();
  this.showReminderPicker.set(!this.showReminderPicker());
}

onReminderSaved(dto: CreateReminderDto): void {
  dto.noteId = this.note.id;
  this.reminderService.createReminder(dto).subscribe({
    next: () => {
      this.showReminderPicker.set(false);
      this.noteUpdated.emit();
    },
    error: (err) => console.error('Failed to create reminder:', err)
  });
}

onReminderPickerCancelled(): void {
  this.showReminderPicker.set(false);
}
```

---

## Integration Steps

### 1. **Database Migration**
```bash
cd Backend/DataBaseLayer
dotnet ef migrations add AddReminderFeature
dotnet ef database update
```

### 2. **Run Backend**
```bash
cd Backend/FundooNotes
dotnet run
```

### 3. **Run Frontend**
```bash
cd Frontend
ng serve
```

### 4. **Test Endpoints**
```
POST   /api/reminders                    - Create reminder
GET    /api/reminders/upcoming           - Get upcoming reminders
GET    /api/reminders/note/{noteId}      - Get reminders for note
PUT    /api/reminders/{id}               - Update reminder
DELETE /api/reminders/{id}               - Delete reminder
```

---

## Testing Strategy

### Backend Unit Tests
```csharp
[Fact]
public async Task CreateReminder_WithValidData_ShouldCreateSuccessfully()
{
    // Arrange
    var dto = new CreateReminderDto 
    { 
        NoteId = 1,
        ReminderDateTime = DateTime.UtcNow.AddDays(1),
        IsRecurring = false
    };

    // Act
    var result = await _reminderService.CreateAsync(dto, 1);

    // Assert
    Assert.NotNull(result);
    Assert.Equal(1, result.NoteId);
}
```

### Frontend Unit Tests
```typescript
it('should create reminder successfully', () => {
  // Arrange
  const dto: CreateReminderDto = { ... };
  const mockResponse: Reminder = { ... };

  spyOn(httpClientSpy, 'post').and.returnValue(of({ data: mockResponse }));

  // Act
  reminderService.createReminder(dto).subscribe(reminder => {
    expect(reminder).toEqual(mockResponse);
  });
});
```

---

## Next Steps

1. Implement the code above in your application
2. Create the database migration and run it
3. Test all endpoints with Postman/Swagger
4. Implement frontend UI for reminders
5. Add background job service for sending notifications
6. Implement email/push notifications

---

**Estimated Time**: 2-3 days for full implementation

**Difficulty**: Medium

**Value**: High (Critical feature for productivity app)
