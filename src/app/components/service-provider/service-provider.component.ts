import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ServiceProviderService} from "../../service/service-provider.service";

@Component({
  selector: 'app-service-provider',
  templateUrl: './service-provider.component.html',
  styleUrls: ['./service-provider.component.scss']
})
export class ServiceProviderComponent implements OnInit {

  @Input() serviceProvider: any;

  constructor(private serviceProviderService: ServiceProviderService) { }

  ngOnInit(): void {}

  onToggleSelectValue(serviceProvider: any) {
    serviceProvider.selected = !serviceProvider.selected;
    if(serviceProvider.selected){
      this.serviceProviderService.setSelectedServiceProvider(serviceProvider);
    }
    else {
      this.serviceProviderService.setSelectedServiceProvider(null);
    }
  }

}
