import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { Task, CreateTaskDto } from '../../models/task.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  
  // Task lists by status
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  // Filters
  selectedCategory: string = 'all';
  searchQuery: string = '';

  // New task form
  showTaskForm = false;
  newTask: CreateTaskDto = {
    title: '',
    description: '',
    status: 'todo',
    category: 'work'
  };

  // Edit mode
  editingTask: Task | null = null;

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
        this.organizeTasks();
      },
      error: (err) => {
        console.error('Error loading tasks', err);
      }
    });
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesCategory = this.selectedCategory === 'all' || task.category === this.selectedCategory;
      const matchesSearch = !this.searchQuery || 
        task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (task.description?.toLowerCase().includes(this.searchQuery.toLowerCase()) ?? false);
      
      return matchesCategory && matchesSearch;
    });
  }

  organizeTasks(): void {
    this.todoTasks = this.filteredTasks.filter(t => t.status === 'todo');
    this.inProgressTasks = this.filteredTasks.filter(t => t.status === 'in_progress');
    this.doneTasks = this.filteredTasks.filter(t => t.status === 'done');
  }

  onCategoryChange(): void {
    this.applyFilters();
    this.organizeTasks();
  }

  onSearchChange(): void {
    this.applyFilters();
    this.organizeTasks();
  }

  openTaskForm(): void {
    this.showTaskForm = true;
    this.editingTask = null;
    this.newTask = {
      title: '',
      description: '',
      status: 'todo',
      category: 'work'
    };
  }

  closeTaskForm(): void {
    this.showTaskForm = false;
    this.editingTask = null;
  }

  saveTask(): void {
    if (!this.newTask.title.trim()) {
      return;
    }

    if (this.editingTask) {
      // Update existing task
      this.taskService.updateTask(this.editingTask.id!, this.newTask).subscribe({
        next: () => {
          this.loadTasks();
          this.closeTaskForm();
        },
        error: (err) => console.error('Error updating task', err)
      });
    } else {
      // Create new task
      this.taskService.createTask(this.newTask).subscribe({
        next: () => {
          this.loadTasks();
          this.closeTaskForm();
        },
        error: (err) => console.error('Error creating task', err)
      });
    }
  }

  editTask(task: Task): void {
    this.editingTask = task;
    this.newTask = {
      title: task.title,
      description: task.description,
      status: task.status,
      category: task.category
    };
    this.showTaskForm = true;
  }

  deleteTask(task: Task): void {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    this.taskService.deleteTask(task.id!).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (err) => console.error('Error deleting task', err)
    });
  }

  drop(event: CdkDragDrop<Task[]>, newStatus: 'todo' | 'in_progress' | 'done'): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      
      // Update task status
      this.taskService.updateTask(task.id!, { status: newStatus }).subscribe({
        next: () => {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
        },
        error: (err) => console.error('Error updating task status', err)
      });
    }
  }

  canEdit(): boolean {
    return this.currentUser?.role?.name !== 'viewer';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}