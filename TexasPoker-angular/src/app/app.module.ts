import { NgModule } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import {HomeComponent} from './home/home.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import {MaterialModule} from './material-module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PokerComponent} from './poker/poker.component';
import { PlayerComponent } from './player/player.component';
import {RegisterComponent} from './register/register.component';
import { DialogRequireRoomidComponent } from './dialog-require-roomid/dialog-require-roomid.component';
import {JwtInterceptor} from './interceptors/jwt.interceptor';
import {ErrorInterceptor} from './interceptors/error.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    PokerComponent,
    PlayerComponent,
    DialogRequireRoomidComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }],

  bootstrap: [AppComponent],
  entryComponents: [
    DialogRequireRoomidComponent
  ]
})
export class AppModule { }
