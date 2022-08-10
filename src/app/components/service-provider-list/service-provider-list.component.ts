import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ServiceProviderService} from "../../service/service-provider.service";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {openConformationDialog} from "../conformation-dialog/conformation-dialog.component";

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
    private router: Router,
    private dialog: MatDialog
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
    openConformationDialog(
      this.dialog,
      {
        title: "Save Changes",
        content: "Save your current changes?",
        confirmBtnTitle:"Save",
        rejectBtnTitle:"Cancel",
        width: "20em",
        height: "12em"
      })
      .subscribe(
        action=> {
          if(action == 'rejected'){
            // redirect to home
          }
          else if(action == 'confirmed'){
            this.onSaveAndContinue();
          }
        }
      )
  }

  onSaveAndContinue() {
    this.savedSuccessEvent.emit({step: 1, data: this.selectedServiceProvider});
  }
}
