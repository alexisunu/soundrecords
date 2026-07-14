import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { CollectionService } from '../../../core/services/collection';
import { Collection } from '../../../core/models/collection.model';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collections.html',
  styleUrl: './collections.scss',
})
export class Collections implements OnInit {
  // Signals: la app corre Angular zoneless (sin zone.js), así que todo
  // lo que se lee en el template va en signals, no en propiedades planas.
  lists = signal<Collection[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  // Modal "Nueva lista"
  showCreateModal = signal(false);
  newName = signal('');
  newDescription = signal('');
  createLoading = signal(false);
  createError = signal<string | null>(null);

  // id de la lista que se está borrando (para deshabilitar solo esa card)
  deletingId = signal<string | null>(null);

  constructor(private collectionService: CollectionService) {}

  ngOnInit(): void {
    this.loadLists();
  }

  loadLists(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.collectionService
      .getMyCollections()
      .pipe(
        catchError((err) => {
          this.errorMessage.set(
            err?.name === 'TimeoutError'
              ? 'La carga está tardando demasiado. Intenta de nuevo.'
              : 'No pudimos cargar tus listas.',
          );
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.loading.set(false);
        if (res) this.lists.set(res.collections);
      });
  }

  openCreateModal(): void {
    this.newName.set('');
    this.newDescription.set('');
    this.createError.set(null);
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    if (this.createLoading()) return; // no cerrar a mitad de un submit
    this.showCreateModal.set(false);
  }

  submitCreate(): void {
    const name = this.newName().trim();
    if (!name) {
      this.createError.set('Ponle un nombre a la lista.');
      return;
    }

    this.createLoading.set(true);
    this.createError.set(null);

    this.collectionService
      .create({ name, description: this.newDescription().trim() || undefined })
      .subscribe({
        next: (created) => {
          this.createLoading.set(false);
          this.showCreateModal.set(false);
          // El contrato responde { id, name, albumsCount } (0), sin
          // description en el ejemplo -- igual usamos lo que llegue y
          // completamos con lo que el usuario tecleó por si el backend
          // no lo devuelve.
          this.lists.update((current) => [
            { ...created, description: created.description ?? this.newDescription().trim() },
            ...current,
          ]);
        },
        error: (err) => {
          this.createLoading.set(false);
          this.createError.set(
            err?.status === 400
              ? (err?.error?.message ?? 'Datos inválidos.')
              : 'No pudimos crear la lista. Intenta de nuevo.',
          );
        },
      });
  }

  deleteList(list: Collection): void {
    if (this.deletingId()) return;
    const confirmed = confirm(`¿Eliminar "${list.name}"? Esto no se puede deshacer.`);
    if (!confirmed) return;

    this.deletingId.set(list.id);
    this.collectionService.deleteCollection(list.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.lists.update((current) => current.filter((l) => l.id !== list.id));
      },
      error: () => {
        this.deletingId.set(null);
        this.errorMessage.set('No pudimos eliminar esta lista. Intenta de nuevo.');
      },
    });
  }

  // Helper puramente visual: cuántos "cover thumbs" decorativos pintar
  // según albumsCount (máximo 3, mínimo 1 para que la card no se vea
  // vacía). No representa álbumes reales -- ver nota en el modelo.
  coverThumbs(list: Collection): number[] {
    const n = list.albumsCount > 0 ? Math.min(list.albumsCount, 3) : 1;
    return Array.from({ length: n });
  }
}