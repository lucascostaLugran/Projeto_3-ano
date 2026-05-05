import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app';
import { config } from './app.config.server';
export default function () {
  return bootstrapApplication(App, config);
}