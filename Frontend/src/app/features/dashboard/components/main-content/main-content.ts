import { Component, OnInit, Input, signal, inject, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDragStart, CdkDragEnd, CdkDropList, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { TakeNoteComponent } from '../take-note/take-note';
import { NoteCardComponent } from '../note-card/note-card';
import { NoteEditDialogComponent } from '../note-edit-dialog/note-edit-dialog';
import { NoteService } from '../../../../core/services/note.service';
import { Note, NoteOrderItem } from '../../../../core/models/note.model';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule, DragDropModule, TakeNoteComponent, NoteCardComponent, NoteEditDialogComponent],
  templateUrl: './main-content.html',
  styleUrls: ['./main-content.scss']
})
export class MainContentComponent implements OnInit, OnChanges {
  @Input() sidebarExpanded = false;
  @Input() isGridView = true;
  @Input() searchQuery = '';

  @ViewChild('pinnedList') pinnedList!: CdkDropList<Note[]>;
  @ViewChild('otherList') otherList!: CdkDropList<Note[]>;

  private noteService = inject(NoteService);

  allNotes = signal<Note[]>([]);
  pinnedNotes = signal<Note[]>([]);
  otherNotes = signal<Note[]>([]);
  isLoading = signal(true);
  isDragging = signal(false);

  selectedNote = signal<Note | null>(null);
  showEditDialog = signal(false);

  ngOnInit(): void {
    this.loadNotes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchQuery']) {
      this.filterNotes();
    }
  }

  loadNotes(): void {
    this.isLoading.set(true);
    this.noteService.notes$.subscribe(notes => {
      // Store all active notes
      const activeNotes = notes.filter(n => !n.isDeleted && !n.isArchived);
      this.allNotes.set(activeNotes);
      this.filterNotes();
      this.isLoading.set(false);
    });
    this.noteService.refreshNotes();
  }

  filterNotes(): void {
    let notes = this.allNotes();

    // Apply search filter
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      notes = notes.filter(n =>
        (n.title && n.title.toLowerCase().includes(query)) ||
        (n.content && n.content.toLowerCase().includes(query)) ||
        (n.labels && n.labels.some(l => l.name.toLowerCase().includes(query)))
      );
    }

    // Separate pinned and others, sort by displayOrder
    const pinned = notes.filter(n => n.isPinned).sort((a, b) => a.displayOrder - b.displayOrder);
    const others = notes.filter(n => !n.isPinned).sort((a, b) => a.displayOrder - b.displayOrder);
    this.pinnedNotes.set(pinned);
    this.otherNotes.set(others);
  }

  onNoteCreated(): void {
    // Notes are automatically updated via the service's BehaviorSubject
  }

  onNoteUpdated(): void {
    // Notes are automatically updated via the service's BehaviorSubject
  }

  onNoteClick(note: Note): void {
    this.selectedNote.set(note);
    this.showEditDialog.set(true);
  }

  closeEditDialog(): void {
    this.showEditDialog.set(false);
    this.selectedNote.set(null);
  }

  // Track by function for better performance
  trackByNoteId(index: number, note: Note): number {
    return note.id;
  }

  // Drag event handlers
  onDragStarted(event: CdkDragStart): void {
    this.isDragging.set(true);
  }

  onDragEnded(event: CdkDragEnd): void {
    this.isDragging.set(false);
  }

  // Unified drop handler for both lists
  drop(event: CdkDragDrop<Note[]>): void {
    if (event.previousContainer === event.container) {
      // Reordering within the same list
      const notes = [...event.container.data];
      moveItemInArray(notes, event.previousIndex, event.currentIndex);

      // Check which list by comparing with ViewChild references
      if (event.container === this.pinnedList) {
        this.pinnedNotes.set(notes);
        this.saveNoteOrder(notes);
      } else {
        this.otherNotes.set(notes);
        this.saveNoteOrder(notes);
      }
    } else {
      // Moving between lists (pinned <-> other)
      const previousList = [...event.previousContainer.data];
      const currentList = [...event.container.data];
      const movedNote = previousList[event.previousIndex];

      transferArrayItem(previousList, currentList, event.previousIndex, event.currentIndex);

      // Determine source by comparing with ViewChild references
      const isFromPinned = event.previousContainer === this.pinnedList;

      if (isFromPinned) {
        // Moving from pinned to other - unpin the note
        this.pinnedNotes.set(previousList);
        this.otherNotes.set(currentList);
        this.noteService.togglePin(movedNote.id).subscribe(() => {
          // Save order for both lists after pin toggle
          this.saveNoteOrder([...previousList, ...currentList]);
        });
      } else {
        // Moving from other to pinned - pin the note
        this.otherNotes.set(previousList);
        this.pinnedNotes.set(currentList);
        this.noteService.togglePin(movedNote.id).subscribe(() => {
          // Save order for both lists after pin toggle
          this.saveNoteOrder([...currentList, ...previousList]);
        });
      }
    }
  }

  // Save note order to backend
  private saveNoteOrder(notes: Note[]): void {
    const noteOrders: NoteOrderItem[] = notes.map((note, index) => ({
      noteId: note.id,
      displayOrder: index
    }));

    this.noteService.reorderNotes({ noteOrders }).subscribe();
  }
}
