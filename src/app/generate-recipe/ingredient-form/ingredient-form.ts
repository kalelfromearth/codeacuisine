import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IngredientUnit } from '../ingredient.model';
import { IngredientListService, MAX_INGREDIENTS } from '../ingredient-list.service';

type IngredientFormControls = {
  name: FormControl<string>;
  amount: FormControl<number>;
  unit: FormControl<IngredientUnit>;
};

@Component({
  selector: 'app-ingredient-form',
  imports: [ReactiveFormsModule],
  templateUrl: './ingredient-form.html',
  styleUrl: './ingredient-form.scss',
})
export class IngredientForm {
  private readonly ingredientList = inject(IngredientListService);

  readonly maxIngredients = MAX_INGREDIENTS;
  readonly isListFull = this.ingredientList.isListFull;
  readonly units: IngredientUnit[] = ['piece', 'ml', 'gram'];

  readonly ingredientForm: FormGroup<IngredientFormControls> = new FormGroup<IngredientFormControls>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    amount: new FormControl(100, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    unit: new FormControl<IngredientUnit>('gram', { nonNullable: true }),
  });

  /** Adds the entered ingredient to the shared list and resets the form. */
  addIngredient(): void {
    if (this.ingredientForm.invalid) {
      this.ingredientForm.markAllAsTouched();
      return;
    }
    this.ingredientList.addIngredient(this.ingredientForm.getRawValue());
    this.resetForm();
  }

  private resetForm(): void {
    this.ingredientForm.reset({ name: '', amount: 100, unit: 'gram' });
  }
}
