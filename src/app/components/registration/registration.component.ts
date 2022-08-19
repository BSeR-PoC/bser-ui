import { Component, OnInit } from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {ServiceProviderRegistrationService} from "../../service/service-provider-registration.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  public dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['organizationName', 'practitionerName'];
  serviceProviderRegistrationForm: FormGroup;
  dataSubscription: Subscription;

  constructor(private providerRegistrationService: ServiceProviderRegistrationService) { }

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
          npi: new FormControl()
        }),
      organization: new FormGroup({
        name: new FormControl(null, [Validators.required]),
        phone: new FormControl(null, [Validators.required])
      }),
      endpoint: new FormControl(null, [Validators.required]),
      });
  }

  // TODO: Review this, need a better way to handle refreshing from server since the return of a transaction bundle is just success/error.
  onSubmit(): void {
    this.providerRegistrationService.createNewServiceProvider(this.serviceProviderRegistrationForm.value).subscribe(
      {
        next: (data: any) => {
           this.dataSubscription = this.providerRegistrationService.getServiceProviders().subscribe({
              next: (data: any) => this.dataSource = data,
              error: console.error
            })
        },
        error: console.error
      }
    );
  }

}
