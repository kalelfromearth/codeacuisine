import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IngredientUnit } from '../ingredient.model';

@Component({
  selector: 'app-unit-select',
  imports: [ReactiveFormsModule],
  templateUrl: './unit-select.html',
  styleUrl: './unit-select.scss',
})
export class UnitSelect {
  readonly control = input.required<FormControl<IngredientUnit>>();
  readonly units = input.required<readonly IngredientUnit[]>();
  readonly label = input('Unit');
  readonly unitChange = output<IngredientUnit>();

  /** Reports the newly selected unit to the parent component. */
  emitUnitChange(event: Event): void {
    this.unitChange.emit((event.target as HTMLSelectElement).value as IngredientUnit);
  }
}
