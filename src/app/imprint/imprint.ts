import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../shared/header/header';
import { CONTACT_EMAIL } from '../shared/legal/legal-contact';

@Component({
  selector: 'app-imprint',
  imports: [Header, RouterLink],
  templateUrl: './imprint.html',
  styleUrl: '../shared/legal/legal-page.scss',
})
export class Imprint {
  readonly contactEmail = CONTACT_EMAIL;
}
