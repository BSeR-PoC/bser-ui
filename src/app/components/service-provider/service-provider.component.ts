import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ServiceProviderService} from "../../service/service-provider.service";

@Component({
  selector: 'app-service-provider',
  templateUrl: './service-provider.component.html',
  styleUrls: ['./service-provider.component.scss']
})
export class ServiceProviderComponent {

  @Input() serviceProvider: any;
  @Output() selectedProviderEvent = new EventEmitter();
  contactInfoExpanded = false;

  constructor() { }

  ngOnInit(): void {}

  onToggleSelectValue(serviceProvider: any) {
    serviceProvider.selected = !serviceProvider.selected;
    this.selectedProviderEvent.emit(serviceProvider);
  }

}
