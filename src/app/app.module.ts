import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LaunchComponent} from './launch/launch.component';
import {MainComponent} from './main/main.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatSortModule} from "@angular/material/sort";
import {HttpClientModule} from "@angular/common/http";
import {MatRadioModule} from "@angular/material/radio";
import {MatCardModule} from "@angular/material/card";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatListModule} from "@angular/material/list";
import {PatientDemographicsComponent} from './components/patient-demographics/patient-demographics.component';
import {ActiveReferralsComponent} from './components/active-referrals/active-referrals.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import { CreateReferralComponent } from './components/create-referral/create-referral.component';
import {MatStepperModule} from "@angular/material/stepper";
import { ServiceProviderComponent } from './components/service-provider/service-provider.component';
import { ServiceProviderListComponent } from './components/service-provider-list/service-provider-list.component';

@NgModule({
  declarations: [
    AppComponent,
    LaunchComponent,
    MainComponent,
    PatientDemographicsComponent,
    ActiveReferralsComponent,
    CreateReferralComponent,
    ServiceProviderComponent,
    ServiceProviderListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    HttpClientModule,
    MatRadioModule,
    MatCardModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatListModule,
    MatSidenavModule,
    MatStepperModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
