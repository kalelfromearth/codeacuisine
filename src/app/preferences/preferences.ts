import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MAX_COOKS, MAX_SERVINGS, MIN_COOKS, MIN_SERVINGS } from '../recipe/recipe.model';
import { Header } from '../shared/header/header';
import { Stepper } from '../shared/stepper/stepper';

type PreferencesFormControls = {
  servings: FormControl<number>;
  cooks: FormControl<number>;
};

@Component({
  selector: 'app-preferences',
  imports: [Header, ReactiveFormsModule, RouterLink, Stepper],
  templateUrl: './preferences.html',
  styleUrl: './preferences.scss',
})
export class Preferences {
  readonly minServings = MIN_SERVINGS;
  readonly maxServings = MAX_SERVINGS;
  readonly minCooks = MIN_COOKS;
  readonly maxCooks = MAX_COOKS;

  readonly preferencesForm: FormGroup<PreferencesFormControls> = new FormGroup<PreferencesFormControls>({
    servings: new FormControl(2, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(MIN_SERVINGS), Validators.max(MAX_SERVINGS)],
    }),
    cooks: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(MIN_COOKS), Validators.max(MAX_COOKS)],
    }),
  });
}
