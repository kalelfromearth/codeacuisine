import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../shared/header/header';

@Component({
  selector: 'app-imprint',
  imports: [Header, RouterLink],
  templateUrl: './imprint.html',
  styleUrl: './imprint.scss',
})
export class Imprint {
  readonly contactEmail = 'developer@andreas-kissner.cloud';
}
