import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../shared/header/header';
import { CONTACT_EMAIL } from '../shared/legal/legal-contact';

@Component({
  selector: 'app-privacy',
  imports: [Header, RouterLink],
  templateUrl: './privacy.html',
  styleUrl: '../shared/legal/legal-page.scss',
})
export class Privacy {
  readonly contactEmail = CONTACT_EMAIL;
}
