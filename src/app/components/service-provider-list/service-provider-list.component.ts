import {Component, OnInit} from '@angular/core';
import {ServiceProviderService} from "../../service/service-provider.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-service-provider-list',
  templateUrl: './service-provider-list.component.html',
  styleUrls: ['./service-provider-list.component.scss']
})
export class ServiceProviderListComponent implements OnInit {

  serviceProviders: any[] = null;
  selectedServiceProvider$: Subscription;
  selectedServiceProvider: any = null;

  constructor(
    private serviceProviderService: ServiceProviderService
  ) { }

  getServiceProviders(): void {
    this.serviceProviderService.getServiceProviders()
      .subscribe({
        next: (data: any) => this.serviceProviders = data,
        error: console.error
      });
  }

  //This may need to just be extracted as a service
  setServiceProviderList(): void {
    this.selectedServiceProvider$ = this.serviceProviderService.getSelectedServiceProvider().subscribe({
        next: selectedServiceProvider => {
          if (selectedServiceProvider) {
            this.serviceProviders.forEach(
              serviceProvider => {
                if (selectedServiceProvider.serverProviderId === selectedServiceProvider.serverProviderId) {
                  serviceProvider = selectedServiceProvider;
                }
              }
            );
          } else {
            this.serviceProviders?.forEach(serviceProvider => serviceProvider.selected = false)
          }
        }
      }
    );
  }

  ngOnInit(): void {
    this.getServiceProviders();
    this.setServiceProviderList();
  }

  ngOnDestroy() : void{
    this.selectedServiceProvider$.unsubscribe();
  }

}
