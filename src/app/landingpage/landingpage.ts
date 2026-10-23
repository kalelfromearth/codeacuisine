import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../shared/header/header';
import { Button } from '../shared/button/button';

@Component({
  selector: 'app-landingpage',
  imports: [Header, Button, RouterLink],
  templateUrl: './landingpage.html',
  styleUrl: './landingpage.scss',
})
export class Landingpage {}
