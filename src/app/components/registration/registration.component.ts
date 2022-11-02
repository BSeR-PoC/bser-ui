import { Component, OnInit } from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {ServiceProviderRegistrationService} from "../../service/service-provider-registration.service";
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {FhirTerminologyConstants} from "../../providers/fhir-terminology-constants";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  public dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['organizationName', 'practitionerName', 'deleteButton'];
  serviceProviderRegistrationForm: FormGroup;
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
    this.serviceProviderRegistrationForm = new FormGroup({
      practitioner: new FormGroup({
        givenName: new FormControl(),
        familyName: new FormControl(),
        phone: new FormControl(),
        npi: new FormControl(null,
          [Validators.minLength(10), Validators.maxLength(10)])
      }),
      organization: new FormGroup({
        name: new FormControl(null, [Validators.required]),
        phone: new FormControl(null, [Validators.required])
      }),
      location: new FormGroup( {
        name: new FormControl(),
        phone: new FormControl(),
        street1: new FormControl(),
        street2: new FormControl(),
        city: new FormControl(),
        state: new FormControl(),
        zip: new FormControl()
      }),
      services: new FormGroup({
        serviceType: this.createServiceTypeControls(this.fhirConstants.SERVICE_TYPES),
        days: this.createDayOfWeekControls(this.fhirConstants.DAYS_OF_WEEK),
        languages: this.createLanguageControls(this.fhirConstants.LANGUAGE),
        startTime: new FormControl(null, [Validators.required]),
        endTime: new FormControl(null, [Validators.required])
      }),
      endpoint: new FormGroup({
        address: new FormControl(null, [Validators.required]),
      })});
  }

  private createDayOfWeekControls(daysOfWeek: any[]) {
    const arr = daysOfWeek.map(day => {
      return new FormControl();
    });
    return new FormArray(arr);
  }
  private createServiceTypeControls(serviceTypes: any[]) {
    const arr = serviceTypes.map(serviceType => {
      return new FormControl();
    });
    return new FormArray(arr);
  }
  private createLanguageControls(languages: any[]) {
    const arr = languages.map(language => {
      return new FormControl();
    });
    return new FormArray(arr);
  }

  // TODO: Review this, need a better way to handle refreshing from server since the return of a transaction bundle is just success/error.
  onSubmit(): void {
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
