import { Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-button',
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  variant = input<'primary' | 'secondary' | 'light'>('primary');
  type = input<'button' | 'submit'>('button');
  link = input<string>();

  readonly buttonClasses = computed(() => `btn btn--${this.variant()}`);
}
