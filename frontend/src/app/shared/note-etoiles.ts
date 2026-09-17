import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-note-etoiles',
  template: `
    <span class="etoiles" [attr.aria-label]="note + ' sur 5'">
      @for (i of [1, 2, 3, 4, 5]; track i) {
        <i class="bi" [class.bi-star-fill]="i <= arrondi" [class.bi-star]="i > arrondi"></i>
      }
    </span>
    @if (nombreAvis !== undefined) {
      <span class="text-muted small ms-1">({{ nombreAvis }})</span>
    }
  `,
})
export class NoteEtoilesComponent {
  @Input({ required: true }) note!: number;
  @Input() nombreAvis?: number;

  get arrondi(): number {
    return Math.round(this.note);
  }
}
