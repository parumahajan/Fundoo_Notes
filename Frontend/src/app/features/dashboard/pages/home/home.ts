import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { MainContentComponent } from '../../components/main-content/main-content';
import { LabelService } from '../../../../core/services/label.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent, MainContentComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  private labelService = inject(LabelService);

  sidebarExpanded = signal(false);
  isGridView = signal(true);
  searchQuery = signal('');

  ngOnInit(): void {
    // Load labels when component initializes
    this.labelService.refreshLabels();
  }

  toggleSidebar(): void {
    this.sidebarExpanded.update(value => !value);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  onViewModeChange(isGrid: boolean): void {
    this.isGridView.set(isGrid);
  }
}
