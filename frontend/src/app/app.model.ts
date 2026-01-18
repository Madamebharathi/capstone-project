import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';  //needed for router-outlet
import { App } from './app';
import { Login } from './auth/login/login';

@NgModule({
  declarations: [
    App,
    Login, // any other non-standalone components
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([]) // important for <router-outlet>
  ],
  bootstrap: [App]
})
export class AppModule {}
