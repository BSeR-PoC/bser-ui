import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LaunchComponent} from './components/launch/launch.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatLegacyInputModule as MatInputModule} from "@angular/material/legacy-input";
import {MatLegacyButtonModule as MatButtonModule} from "@angular/material/legacy-button";
import {MatLegacyTableModule as MatTableModule} from "@angular/material/legacy-table";
import {MatLegacyPaginatorModule as MatPaginatorModule} from "@angular/material/legacy-paginator";
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from "@angular/material/legacy-progress-spinner";
import {MatSortModule} from "@angular/material/sort";
import {HttpClientModule} from "@angular/common/http";
import {MatLegacyRadioModule as MatRadioModule} from "@angular/material/legacy-radio";
import {MatLegacyCardModule as MatCardModule} from "@angular/material/legacy-card";
import {MatLegacyTooltipModule as MatTooltipModule} from "@angular/material/legacy-tooltip";
import {MatLegacyListModule as MatListModule} from "@angular/material/legacy-list";
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
import {MatLegacySelectModule as MatSelectModule} from "@angular/material/legacy-select";
import {FhirTerminologyConstants} from "./providers/fhir-terminology-constants";
import {MatLegacyCheckboxModule as MatCheckboxModule} from "@angular/material/legacy-checkbox";
import { ConformationDialogComponent } from './components/conformation-dialog/conformation-dialog.component';
import {MatLegacyDialogModule as MatDialogModule} from "@angular/material/legacy-dialog";
import {ReferralManagerComponent} from "./components/referral-manager/referral-manager.component";
import {MatLegacyTabsModule as MatTabsModule} from "@angular/material/legacy-tabs";
import { RegistrationComponent } from './components/registration/registration.component';
import { DaysOfWeekPipe } from './pipes/days-of-week.pipe';
import { MilitaryToStandardTimePipe } from './pipes/military-to-standard-time.pipe';
import { ServiceTypePipe } from './pipes/service-type.pipe';
import { LandingComponent } from './components/landing/landing.component';
import { ServiceRequestListComponent } from './components/service-request-list/service-request-list.component';
import {MatLegacySnackBarModule as MatSnackBarModule} from "@angular/material/legacy-snack-bar";
import { TelecomComponent } from './components/fhir-widgets/telecom/telecom.component';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {MatDividerModule} from '@angular/material/divider';
import { ReviewAndSendComponent } from './components/review-and-send/review-and-send.component';

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
