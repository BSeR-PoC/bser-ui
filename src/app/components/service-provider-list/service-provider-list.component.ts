import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ServiceProviderService} from "../../service/service-provider.service";
import {Router} from "@angular/router";
import {openConformationDialog} from "../conformation-dialog/conformation-dialog.component";
import {UtilsService} from "../../service/utils.service";
import {MatDialog} from "@angular/material/dialog";

const CURRENT_STEP = 1;

@Component({
    selector: 'app-service-provider-list',
    templateUrl: './service-provider-list.component.html',
    styleUrls: ['./service-provider-list.component.scss'],
    standalone: false
})
export class ServiceProviderListComponent implements OnInit {

  serviceProviders: any[] = null;
  selectedServiceProvider: any = null;
  isLoading: boolean = false

  @Input() serviceRequest: any; //TODO check why ServiceRequest Type doesn't work here and type any works
  @Output() savedSuccessEvent = new EventEmitter();
  @Output() serviceProviderSelectedEvent = new EventEmitter();
  @Output() requestStep = new EventEmitter();

  constructor(
    private serviceProviderService: ServiceProviderService,
    private router: Router,
    private dialog: MatDialog,
    private utilsService: UtilsService
  ) { }


  getServiceProviders(): void {
    this.isLoading = true;
    this.serviceProviderService.getServiceProviders()
      .subscribe({
        next: (data: any) => {
          this.serviceProviders = data;
          this.isLoading = false;
          //We need to set the selected service provider if we are updating existing service request.
          if (this.serviceRequest?.performer?.[0]?.reference?.replace(this.serviceProviders, 'PractitionerRole/', '')){
            const selectedServiceProvider = this.getSelectedServiceRequestProvider(
              this.serviceProviders,
              this.serviceRequest?.performer?.[0]?.reference?.replace('PractitionerRole/', '')
            );
            this.onSelectedServiceProvider(selectedServiceProvider);
          }
        },
        error: (err)=> {
          console.error(err);
          this.utilsService.showErrorNotification(err?.message?.toString());
          this.isLoading = false;
        }
      });
  }

  ngOnInit(): void {
    this.getServiceProviders();
  }

  onCancel() {
    if (
      !this.selectedServiceProvider
      ||
      this.serviceRequest.performer[0]?.reference?.value?.toString()?.includes(this.selectedServiceProvider.serviceProviderId)
    ){
      this.router.navigate(['/']);
    }
    else {
      openConformationDialog(
        this.dialog,
        {
          title: "Save Changes",
          content: "Save your current changes?",
          defaultActionBtnTitle: "Save and Continue",
          secondaryActionBtnTitle: "Cancel",
          width: "20em",
          height: "12em"
        })
        .subscribe(
          action => {
            if (action == 'secondaryAction') {
              this.router.navigate(['/']);
            }
            else if (action == 'defaultAction') {
              this.onSave(CURRENT_STEP + 1);
            }
          }
        )
    }

  }

  onSave(requestedStep?: number) {
    this.savedSuccessEvent.emit({ requestedStep: requestedStep, data: this.selectedServiceProvider });
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

  private getSelectedServiceRequestProvider(serviceProviders: any[], serviceProviderId: string): any {
    if(!serviceProviders || serviceProviders.length == 0 || !serviceProviderId){
      return null;
    }
    const serviceProvider = this.serviceProviders.find( serviceProvider => serviceProvider.serviceProviderId === serviceProviderId);
    if(!serviceProvider){
      console.error("Service provider with id: " + serviceProviderId + "is not a valid service provider.");
      return null;
    }
    serviceProvider.selected = true;
    return serviceProvider;
  }

  onProceed() {
    if (
      !this.serviceRequest.performer[0]?.reference?.value?.toString()?.includes(this.selectedServiceProvider.serviceProviderId)
    ) {
      this.onSave(CURRENT_STEP + 1);
    } else {
      this.requestStep.emit(CURRENT_STEP + 1)
    }
  }
}
