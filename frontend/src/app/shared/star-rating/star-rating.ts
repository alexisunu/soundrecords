import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.scss',
})
export class StarRating {
  @Input() rating = 0;
  @Input() max = 5;

  get stars(): boolean[] {
    const rounded = Math.round(this.rating);
    return Array.from({ length: this.max }, (_, i) => i < rounded);
  }
}
