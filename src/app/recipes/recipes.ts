import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecipeGeneratorService } from '../recipe/recipe-generator.service';
import { Button } from '../shared/button/button';
import { Header } from '../shared/header/header';

@Component({
  selector: 'app-recipes',
  imports: [Button, Header, RouterLink],
  templateUrl: './recipes.html',
  styleUrl: './recipes.scss',
})
export class Recipes {
  private readonly generator = inject(RecipeGeneratorService);

  readonly recipes = this.generator.recipes;
  readonly cuisineLabel = computed(() => this.toLabel(this.recipes()[0]?.cuisine ?? ''));
  readonly timeLabel = computed(() => this.toLabel(this.recipes()[0]?.timeCategory ?? ''));

  private toLabel(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
