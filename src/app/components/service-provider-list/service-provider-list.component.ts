import {Component, OnInit} from '@angular/core';
import {MockDataRetrievalService} from "../../service/mock-data-retrieval.service";

@Component({
  selector: 'app-service-provider-list',
  templateUrl: './service-provider-list.component.html',
  styleUrls: ['./service-provider-list.component.scss']
})
export class ServiceProviderListComponent implements OnInit {

  serviceProviders: any[] = null;

  constructor(
    private mockDataRetrievalService: MockDataRetrievalService
  ) { }

  ngOnInit(): void {
    this.mockDataRetrievalService.getServiceProviders()
      .subscribe({
        next: (data: any) => this.serviceProviders = data,
        error: console.error
      });
  }

  // Only one item can be selected at a given time.
  // The function set selected to false for all items except for the item passed as a function argument.
  updateProviderSelectedValue(serviceProvider: any) {
    this.serviceProviders.forEach(
      provider => {
        provider.serviceProviderId === serviceProvider.serviceProviderId ?
          provider.selected = serviceProvider.selected : provider.selected = false
      }
    )
  }
}
