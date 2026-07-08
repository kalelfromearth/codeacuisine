import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  variant = input<'primary' | 'secondary'>('primary');
  type = input<'button' | 'submit'>('button');
}
