import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ServiceProviderService} from "../../service/service-provider.service";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {openConformationDialog} from "../conformation-dialog/conformation-dialog.component";

@Component({
  selector: 'app-service-provider-list',
  templateUrl: './service-provider-list.component.html',
  styleUrls: ['./service-provider-list.component.scss']
})
export class ServiceProviderListComponent implements OnInit, OnChanges {

  serviceProviders: any[] = null;
  selectedServiceProvider: any = null;
  isLoading: boolean = false

  @Input() serviceRequest: any;
  @Output() savedSuccessEvent = new EventEmitter();
  @Output() serviceProviderSelectedEvent = new EventEmitter();

  constructor(
    private serviceProviderService: ServiceProviderService,
    private router: Router,
    private dialog: MatDialog
  ) { }


  getServiceProviders(): void {
    this.isLoading = true;
    this.serviceProviderService.getServiceProviders()
      .subscribe({
        next: (data: any) => {
          this.serviceProviders = data;
          this.isLoading = false;
          //We need to set the selected service provider if we are updating existing service request.
          if (
            this.serviceRequest?.id && this.serviceRequest?.performer?.[0]?.reference?.replace('PractitionerRole/', '')
          ){
            const selectedServiceProvider = this.getSelectedServiceRequestProvider(
              this.serviceProviders,
              this.serviceRequest?.performer?.[0]?.reference?.replace('PractitionerRole/', '')
            );
            this.onSelectedServiceProvider(selectedServiceProvider);
          }
        },
        error: (err)=> {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  ngOnInit(): void {
    this.getServiceProviders();
  }

  onCancel() {
    if(!this.selectedServiceProvider
      ||
      this.serviceRequest?.serviceProvider == this.selectedServiceProvider
    ){
      this.router.navigate(['/']);
    }
    else {
      openConformationDialog(
        this.dialog,
        {
          title: "Save Changes",
          content: "Save your current changes?",
          confirmBtnTitle: "Save",
          rejectBtnTitle: "Cancel",
          width: "20em",
          height: "12em"
        })
        .subscribe(
          action => {
            if (action == 'rejected') {
              this.router.navigate(['/']);
            }
            else if (action == 'confirmed') {
              this.onSaveAndContinue();
            }
          }
        )
    }

  }

  onSaveAndContinue() {
    this.savedSuccessEvent.emit({step: 1, data: this.selectedServiceProvider});
  }

  onSave() {
    this.savedSuccessEvent.emit({data: this.selectedServiceProvider});
  }

  onSelectedServiceProvider(serviceProvider: any) {
    if(serviceProvider.selected){
      this.selectedServiceProvider = serviceProvider;
      this.serviceProviders = this.serviceProviders
        .map(serviceProvider => {
          if(serviceProvider.serviceProviderId === this.selectedServiceProvider.serviceProviderId){
             return this.selectedServiceProvider
          }
          else {
            serviceProvider.selected = false;
            return serviceProvider;
          }
        });
    }
    else {
      this.serviceProviders.forEach(serviceProvider => serviceProvider.selected = false);
      this.selectedServiceProvider = null;
    }

    this.serviceProviderSelectedEvent.emit(serviceProvider);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // We need to set the selected service provider if we are updating existing service request.
    if(
      changes['serviceRequest'].currentValue?.id
      &&
      changes['serviceRequest'].currentValue?.performer?.[0]?.reference?.replace('PractitionerRole/', '')?.length > 0
      && this.serviceProviders?.length > 0
    ){
      const serviceProvider = this.getSelectedServiceRequestProvider (
        this.serviceProviders,
        changes['serviceRequest'].currentValue?.performer?.[0]?.reference?.replace('PractitionerRole/', '')
      )
      this.onSelectedServiceProvider(serviceProvider);
    }
  }

  private getSelectedServiceRequestProvider(serviceProviders: any[], serviceProviderId: string): any {
    if(!serviceProviders || serviceProviders.length == 0 || !serviceProviderId){
      return null;
    }
    const serviceProvider = this.serviceProviders.find( serviceProvider => serviceProvider.serviceProviderId === serviceProviderId);
    if(!serviceProvider){
      // TODO fix this error for create new service request.
      console.error("Service provider with id: " + serviceProviderId + "is not a valid service provider.");
      return null;
    }
    serviceProvider.selected = true;
    return serviceProvider;
  }
}
