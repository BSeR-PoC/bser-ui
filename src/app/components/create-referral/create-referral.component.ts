import { Component, OnInit } from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {ServiceProviderService} from "../../service/service-provider.service";

@Component({
  selector: 'app-create-referral',
  templateUrl: './create-referral.component.html',
  styleUrls: ['./create-referral.component.scss']
})
export class CreateReferralComponent implements OnInit {

  selectedServiceProvider$: Observable<any>;
  // selectedServiceProvider: any = null;

  constructor(
    private serviceProviderService: ServiceProviderService
  ) { }

  ngOnInit(): void {
    this.selectedServiceProvider$ = this.serviceProviderService.getSelectedServiceProvider();
  }

  ngOnDestroy() : void{
   // this.selectedServiceProvider$.unsubscribe();
  }

  onCancel() {
    this.serviceProviderService.setSelectedServiceProvider(null);
  }
}
