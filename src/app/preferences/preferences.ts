import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../shared/header/header';

@Component({
  selector: 'app-preferences',
  imports: [Header, RouterLink],
  templateUrl: './preferences.html',
  styleUrl: './preferences.scss',
})
export class Preferences {}
