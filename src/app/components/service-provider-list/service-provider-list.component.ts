import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ServiceProviderService} from "../../service/service-provider.service";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-service-provider-list',
  templateUrl: './service-provider-list.component.html',
  styleUrls: ['./service-provider-list.component.scss']
})
export class ServiceProviderListComponent implements OnInit {

  serviceProviders: any[] = null;
  selectedServiceProvider$: Subscription;
  selectedServiceProvider: any = null;

  @Output() savedSuccessEvent = new EventEmitter();

  constructor(
    private serviceProviderService: ServiceProviderService,
    private router: Router
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
            this.serviceProviders = this.serviceProviders.map(
              serviceProvider => {
                if (selectedServiceProvider.serviceProviderId === serviceProvider.serviceProviderId) {
                  serviceProvider = selectedServiceProvider;
                }
                else {
                  serviceProvider.selected = false;
                }
                return serviceProvider;
              }
            );
          }
          else {
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

  onCancel() {
    // TODO not sure what action we are going to take here?
  }

  onSaveAndContinue() {
    this.savedSuccessEvent.emit();
  }

  onSaveAndExit() {
    //TODO api call to save the state must be executed here
    console.log("onSaveAndExit");
    this.router.navigate(['/'])
  }

  isSaveAndContinueEnabled() {
    // True if at least one service provider is selected
    return this.serviceProviders?.find(provider=>provider.selected);
  }

  isSaveAndExitEnabled() {
    // True if at least one service provider is selected
    return this.serviceProviders?.find(provider=>provider.selected);
  }
}
