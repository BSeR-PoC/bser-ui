import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
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
export class ServiceProviderListComponent implements OnInit, OnChanges {

  serviceProviders: any[] = null;
  selectedServiceProvider: any = null;

  @Input() referral: any;
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
        error: (err)=> console.error(err)
      });
  }

  ngOnInit(): void {
    this.getServiceProviders();
  }

  onCancel() {
    if(!this.selectedServiceProvider
      ||
      this.referral?.serviceProvider == this.selectedServiceProvider
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

  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

}
