import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from '../shared/button/button';
import { Header } from '../shared/header/header';
import { Popup } from '../shared/popup/popup';
import { IngredientForm } from './ingredient-form/ingredient-form';
import { IngredientList } from './ingredient-list/ingredient-list';
import { IngredientListService, MIN_INGREDIENTS } from './ingredient-list.service';

@Component({
  selector: 'app-generate-recipe',
  imports: [Button, Header, IngredientForm, IngredientList, Popup],
  templateUrl: './generate-recipe.html',
  styleUrl: './generate-recipe.scss',
})
export class GenerateRecipe {
  private readonly ingredientList = inject(IngredientListService);
  private readonly router = inject(Router);

  readonly isNotEnoughPopupOpen = signal(false);

  /** Opens the popup with too few ingredients, otherwise continues to the preferences page. */
  goToNextStep(): void {
    if (this.ingredientList.ingredients().length < MIN_INGREDIENTS) {
      this.isNotEnoughPopupOpen.set(true);
      return;
    }
    this.router.navigateByUrl('/preferences');
  }

  /** Closes the "not enough ingredients" popup. */
  closeNotEnoughPopup(): void {
    this.isNotEnoughPopupOpen.set(false);
  }
}
