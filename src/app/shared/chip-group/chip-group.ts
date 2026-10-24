import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

let nextChipGroupId = 0;

export interface ChipOption<Value extends string> {
  value: Value;
  label: string;
  hint?: string;
}

@Component({
  selector: 'app-chip-group',
  imports: [ReactiveFormsModule],
  templateUrl: './chip-group.html',
  styleUrl: './chip-group.scss',
})
export class ChipGroup<Value extends string> {
  readonly legend = input.required<string>();
  readonly iconPath = input.required<string>();
  readonly options = input.required<readonly ChipOption<Value>[]>();
  readonly control = input.required<FormControl<Value>>();
  readonly groupName = `chip-group-${nextChipGroupId++}`;

  /** Returns the id of the radio button for the given option value. */
  getChipId(value: Value): string {
    return `${this.groupName}-${value}`;
  }

  /** Returns the id of the hint text below the chip of the given option value. */
  getHintId(value: Value): string {
    return `${this.groupName}-${value}-hint`;
  }
}
