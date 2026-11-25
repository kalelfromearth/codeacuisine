import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  INGREDIENT_UNITS,
  IngredientUnit,
  MAX_AMOUNT_BY_UNIT,
  UNIT_LABELS,
} from '../ingredient.model';
import { capitalizeIngredientName } from '../ingredient-name.format';
import { plausibleIngredientName } from '../ingredient-name.validator';
import {
  blockNonWholeNumberKey,
  buildAmountErrorMessage,
  capAmountToUnitLimit,
  createAmountControl,
  limitTypedAmount,
} from '../ingredient-amount.rules';
import { IngredientSuggestionService } from '../ingredient-suggestion.service';
import { InfoTip } from '../../shared/info-tip/info-tip';
import { UnitSelect } from '../unit-select/unit-select';
import {
  IngredientListService,
  MAX_INGREDIENTS,
  MIN_INGREDIENTS,
} from '../ingredient-list.service';

const MIN_SUGGESTION_LENGTH = 2;
const SUGGESTION_DELAY_MS = 300;

type IngredientFormControls = {
  name: FormControl<string>;
  amount: FormControl<number | null>;
  unit: FormControl<IngredientUnit>;
};

@Component({
  selector: 'app-ingredient-form',
  imports: [ReactiveFormsModule, InfoTip, UnitSelect],
  templateUrl: './ingredient-form.html',
  styleUrl: './ingredient-form.scss',
})
export class IngredientForm {
  private readonly ingredientList = inject(IngredientListService);
  private readonly suggestionService = inject(IngredientSuggestionService);
  private suggestionTimer: ReturnType<typeof setTimeout> | undefined;
  private suggestionRequest: AbortController | null = null;

  readonly suggestions = signal<string[]>([]);
  readonly activeSuggestion = signal(-1);
  readonly isSuggestionListOpen = computed(this.hasSuggestions.bind(this));
  readonly suggestionStatus = computed(this.describeSuggestions.bind(this));
  readonly minIngredients = MIN_INGREDIENTS;
  readonly maxIngredients = MAX_INGREDIENTS;
  readonly maxAmountByUnit = MAX_AMOUNT_BY_UNIT;
  readonly isListFull = this.ingredientList.isListFull;
  readonly units = INGREDIENT_UNITS;

  readonly ingredientForm: FormGroup<IngredientFormControls> = new FormGroup<IngredientFormControls>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), plausibleIngredientName],
    }),
    amount: createAmountControl(null),
    unit: new FormControl<IngredientUnit>('gram', { nonNullable: true }),
  });

  /** Adds the entered ingredient to the shared list and resets the form. */
  addIngredient(): void {
    const entered = this.ingredientForm.getRawValue();
    if (this.ingredientForm.invalid || entered.amount === null) {
      this.ingredientForm.markAllAsTouched();
      return;
    }
    this.ingredientList.addIngredient({ name: capitalizeIngredientName(entered.name), amount: entered.amount, unit: entered.unit });
    this.resetForm();
  }

  /** Prevents typing characters that are not part of a whole number. */
  blockNonWholeNumberKeys(event: KeyboardEvent): void {
    blockNonWholeNumberKey(event);
  }

  /** Returns the maximum amount allowed for the currently selected unit. */
  getCurrentMaxAmount(): number {
    return MAX_AMOUNT_BY_UNIT[this.ingredientForm.controls.unit.value];
  }

  /** Returns the display name of the currently selected unit, e.g. "ml". */
  getCurrentUnitLabel(): string {
    return UNIT_LABELS[this.ingredientForm.controls.unit.value];
  }

  /** Caps the amount at the maximum of the selected unit while the user is typing. */
  limitAmountToMaximum(event: Event): void {
    limitTypedAmount(event, this.ingredientForm.controls.amount, this.ingredientForm.controls.unit.value);
  }

  /** Applies the limit of the newly selected unit to the amount and revalidates it. */
  applyUnitLimit(selectedUnit: IngredientUnit): void {
    this.ingredientForm.controls.unit.setValue(selectedUnit);
    capAmountToUnitLimit(this.ingredientForm.controls.amount, selectedUnit);
  }

  /** Returns the error message for the name field, or an empty string if it is valid. */
  getNameErrorMessage(): string {
    const nameErrors = this.ingredientForm.controls.name.errors;
    if (nameErrors?.['implausibleName']) {
      return "That doesn't look like an ingredient. Please check the spelling.";
    }
    return nameErrors ? 'Please enter an ingredient.' : '';
  }

  /** Returns the error message for the amount field, or an empty string if it is valid. */
  getAmountErrorMessage(): string {
    return buildAmountErrorMessage(
      this.ingredientForm.controls.amount.errors,
      this.ingredientForm.controls.unit.value,
    );
  }

  /** Waits a moment after typing, then asks for suggestions for the entered text. */
  onNameInput(): void {
    clearTimeout(this.suggestionTimer);
    this.suggestionRequest?.abort();
    const text = this.ingredientForm.controls.name.value.trim();
    if (text.length < MIN_SUGGESTION_LENGTH) {
      this.closeSuggestions();
      return;
    }
    this.suggestionTimer = setTimeout(this.loadSuggestions.bind(this, text), SUGGESTION_DELAY_MS);
  }

  /** Moves through the suggestions with the arrow keys, takes one with Enter and closes the list with Escape. */
  handleNameKeys(event: KeyboardEvent): void {
    if (!this.isSuggestionListOpen()) {
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveActiveSuggestion(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter' && this.activeSuggestion() >= 0) {
      event.preventDefault();
      this.chooseSuggestion(this.suggestions()[this.activeSuggestion()]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeSuggestions();
    }
  }

  /** Puts the chosen suggestion into the name field. */
  chooseSuggestion(text: string): void {
    this.ingredientForm.controls.name.setValue(text);
    this.closeSuggestions();
  }

  /** Closes the list of suggestions and drops a request that is still running. */
  closeSuggestions(): void {
    clearTimeout(this.suggestionTimer);
    this.suggestionRequest?.abort();
    this.suggestions.set([]);
    this.activeSuggestion.set(-1);
  }

  /** Asks the suggestion service for the typed text and shows the answer unless the request was aborted. */
  private async loadSuggestions(text: string): Promise<void> {
    const request = new AbortController();
    this.suggestionRequest = request;
    const found = await this.suggestionService.suggest(text, request.signal);
    if (!request.signal.aborted) {
      this.suggestions.set(found);
      this.activeSuggestion.set(-1);
    }
  }

  /** Moves the highlighted suggestion up or down and wraps around at both ends of the list. */
  private moveActiveSuggestion(step: number): void {
    const count = this.suggestions().length;
    const next = this.activeSuggestion() + step;
    this.activeSuggestion.set(next < 0 ? count - 1 : next % count);
  }

  /** Returns true when at least one suggestion is currently shown. */
  private hasSuggestions(): boolean {
    return this.suggestions().length > 0;
  }

  /** Returns the screen reader hint with the number of suggestions, or an empty text when there are none. */
  private describeSuggestions(): string {
    const count = this.suggestions().length;
    return count > 0 ? `${count} suggestions available. Use the arrow keys and Enter to choose one.` : '';
  }

  /** Closes the suggestions and sets the form back to its empty start values. */
  private resetForm(): void {
    this.closeSuggestions();
    this.ingredientForm.reset({ name: '', amount: null, unit: 'gram' });
    // The amount was reset before the unit, so its check used the old unit and has to run again.
    this.ingredientForm.controls.amount.updateValueAndValidity();
  }
}
