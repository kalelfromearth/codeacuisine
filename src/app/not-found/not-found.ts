import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../shared/header/header';

@Component({
  selector: 'app-not-found',
  imports: [Header, RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {}
