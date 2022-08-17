import { Component, OnInit } from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {ServiceProviderRegistrationService} from "../../service/service-provider-registration.service";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  public dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['organization', 'practitioner'];

  constructor(private providerRegistrationService: ServiceProviderRegistrationService) { }

  ngOnInit(): void {
    this.providerRegistrationService.getServiceProviders()
      .subscribe({
        next: (data: any) => this.dataSource = data,
        error: console.error
      });
  }

}
