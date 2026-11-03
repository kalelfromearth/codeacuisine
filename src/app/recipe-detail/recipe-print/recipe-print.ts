import { Component, computed, input } from '@angular/core';
import { describeIngredientAmount } from '../../generate-recipe/ingredient.model';
import { Recipe, RecipeIngredient, buildRecipeTags } from '../../recipe/recipe.model';
import { QrCode } from './qr-code';

/** What goes on paper: the whole recipe card or only the shopping list of the extra ingredients. */
export type PrintMode = 'recipe' | 'shopping';

const PRINT_DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

@Component({
  selector: 'app-recipe-print',
  templateUrl: './recipe-print.html',
  styleUrl: './recipe-print.scss',
})
export class RecipePrint {
  readonly recipe = input.required<Recipe>();
  readonly ownIngredients = input.required<RecipeIngredient[]>();
  readonly extraIngredients = input.required<RecipeIngredient[]>();
  readonly recipeUrl = input.required<string>();
  readonly mode = input<PrintMode>('recipe');
  readonly qrCode = input<QrCode | null>(null);

  readonly tags = computed(this.buildTags.bind(this));
  readonly printedOn = new Date().toLocaleDateString('en-GB', PRINT_DATE_FORMAT);

  /** Returns the amount of an ingredient for reading, for example "80g" or "2 pieces". */
  describeAmount(ingredient: RecipeIngredient): string {
    return describeIngredientAmount(ingredient);
  }

  private buildTags(): string[] {
    return buildRecipeTags(this.recipe());
  }
}
