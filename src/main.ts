import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

function reportStartError(error: unknown): void {
  console.error(error);
}

bootstrapApplication(App, appConfig).catch(reportStartError);
