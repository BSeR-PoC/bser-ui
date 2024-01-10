import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LaunchComponent} from './components/launch/launch.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatSortModule} from "@angular/material/sort";
import {HttpClientModule} from "@angular/common/http";
import {PatientDemographicsComponent} from './components/patient-demographics/patient-demographics.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatStepperModule} from "@angular/material/stepper";
import {ServiceProviderComponent} from './components/service-provider/service-provider.component';
import {ServiceProviderListComponent} from './components/service-provider-list/service-provider-list.component';
import {
  GeneralInformationAndServiceTypeComponent
} from './components/general-information-and-service-type/general-information-and-service-type.component';
import {ReactiveFormsModule} from "@angular/forms";
import {
  SupportingInformationComponent
} from './components/supporting-information/supporting-information.component';
import {FhirTerminologyConstants} from "./providers/fhir-terminology-constants";
import { ConformationDialogComponent } from './components/conformation-dialog/conformation-dialog.component';
import {ReferralManagerComponent} from "./components/referral-manager/referral-manager.component";
import { RegistrationComponent } from './components/registration/registration.component';
import { DaysOfWeekPipe } from './pipes/days-of-week.pipe';
import { MilitaryToStandardTimePipe } from './pipes/military-to-standard-time.pipe';
import { ServiceTypePipe } from './pipes/service-type.pipe';
import { LandingComponent } from './components/landing/landing.component';
import { ServiceRequestListComponent } from './components/service-request-list/service-request-list.component';
import { TelecomComponent } from './components/fhir-widgets/telecom/telecom.component';
import {MatDividerModule} from '@angular/material/divider';
import { ReviewAndSendComponent } from './components/review-and-send/review-and-send.component';
import {MatRadioModule} from "@angular/material/radio";
import {MatCardModule} from "@angular/material/card";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatListModule} from "@angular/material/list";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatMenuModule} from "@angular/material/menu";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDialogModule} from "@angular/material/dialog";
import {MatTabsModule} from "@angular/material/tabs";

@NgModule({
  declarations: [
    AppComponent,
    LaunchComponent,
    PatientDemographicsComponent,
    ReferralManagerComponent,
    ServiceProviderComponent,
    ServiceProviderListComponent,
    GeneralInformationAndServiceTypeComponent,
    SupportingInformationComponent,
    ConformationDialogComponent,
    RegistrationComponent,
    DaysOfWeekPipe,
    MilitaryToStandardTimePipe,
    ServiceTypePipe,
    LandingComponent,
    ServiceRequestListComponent,
    TelecomComponent,
    ReviewAndSendComponent,
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
    ReactiveFormsModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatTabsModule,
    MatSnackBarModule,
    MatMenuModule,
    MatDividerModule
  ],
  providers: [FhirTerminologyConstants],
  bootstrap: [AppComponent]
})
export class AppModule {
}
