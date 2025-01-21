import { Component, OnInit } from '@angular/core';
import {ServiceProviderRegistrationService} from "../../service/service-provider-registration.service";
import {UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {FhirTerminologyConstants} from "../../providers/fhir-terminology-constants";
import {MatTableDataSource} from "@angular/material/table";

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss'],
    standalone: false
})
export class RegistrationComponent implements OnInit {
  public dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['organizationName', 'practitionerName', 'deleteButton'];
  serviceProviderRegistrationForm: UntypedFormGroup;
  dataSubscription: Subscription;

  constructor(public fhirConstants: FhirTerminologyConstants, private providerRegistrationService: ServiceProviderRegistrationService) { }

  ngOnInit(): void {
    this.dataSubscription = this.providerRegistrationService.getServiceProviders()
      .subscribe({
        next: (data: any) => this.dataSource = data,
        error: console.error
      });

    // TODO: Add validators for practitioner. If any field is given, all are required.
    // TODO: Add service delivery location.
    // TODO: Add Healthcare Services Provided.
    this.serviceProviderRegistrationForm = new UntypedFormGroup({
      practitioner: new UntypedFormGroup({
        givenName: new UntypedFormControl(),
        familyName: new UntypedFormControl(),
        phone: new UntypedFormControl(),
        npi: new UntypedFormControl(null,
          [Validators.minLength(10), Validators.maxLength(10)])
      }),
      organization: new UntypedFormGroup({
        name: new UntypedFormControl(null, [Validators.required]),
        phone: new UntypedFormControl(null, [Validators.required])
      }),
      location: new UntypedFormGroup( {
        name: new UntypedFormControl(),
        phone: new UntypedFormControl(),
        street1: new UntypedFormControl(),
        street2: new UntypedFormControl(),
        city: new UntypedFormControl(),
        state: new UntypedFormControl(),
        zip: new UntypedFormControl()
      }),
      services: new UntypedFormGroup({
        serviceType: this.createServiceTypeControls(this.fhirConstants.SERVICE_TYPES),
        days: this.createDayOfWeekControls(this.fhirConstants.DAYS_OF_WEEK),
        languages: this.createLanguageControls(this.fhirConstants.LANGUAGE),
        startTime: new UntypedFormControl(null, [Validators.required]),
        endTime: new UntypedFormControl(null, [Validators.required])
      }),
      endpoint: new UntypedFormGroup({
        address: new UntypedFormControl(null, [Validators.required]),
      })});
  }

  private createDayOfWeekControls(daysOfWeek: any[]) {
    const arr = daysOfWeek.map(day => {
      return new UntypedFormControl();
    });
    return new UntypedFormArray(arr);
  }
  private createServiceTypeControls(serviceTypes: any[]) {
    const arr = serviceTypes.map(serviceType => {
      return new UntypedFormControl();
    });
    return new UntypedFormArray(arr);
  }
  private createLanguageControls(languages: any[]) {
    const arr = languages.map(language => {
      return new UntypedFormControl();
    });
    return new UntypedFormArray(arr);
  }

  // TODO: Review this, need a better way to handle refreshing from server since the return of a transaction bundle is just success/error.
  onSubmit(): void {
    console.log(this.serviceProviderRegistrationForm.value);
    this.providerRegistrationService.createNewServiceProvider(this.serviceProviderRegistrationForm.value).subscribe(
      {
        next: (data: any) => {
           this.dataSubscription = this.providerRegistrationService.getServiceProviders().subscribe({
              next: (data: any) => {
                this.dataSource = data;
                this.serviceProviderRegistrationForm.reset();
              },
              error: console.error
            })
        },
        error: console.error
      }
    );
  }

  clear(): void {
    this.serviceProviderRegistrationForm.reset();
  }

  onDeleteProvider(resources): void {
    this.providerRegistrationService.deleteServiceProvider(resources).subscribe(
      {
        next: (data: any) => {
          this.dataSubscription = this.providerRegistrationService.getServiceProviders().subscribe({
            next: (data: any) => {
              this.dataSource = data;
              this.serviceProviderRegistrationForm.reset();
            },
            error: console.error
          })
        },
        error: console.error
      }
    );
  }
}
