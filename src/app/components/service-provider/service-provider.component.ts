import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ServiceProviderService} from "../../service/service-provider.service";
import {UtilsService} from "../../service/utils.service";

@Component({
    selector: 'app-service-provider',
    templateUrl: './service-provider.component.html',
    styleUrls: ['./service-provider.component.scss'],
    standalone: false
})
export class ServiceProviderComponent {

  @Input() serviceProvider: any;
  @Output() selectedProviderEvent = new EventEmitter();
  contactInfoExpanded = false;

  constructor(public utilsService: UtilsService) { }

  ngOnInit(): void {}

  onToggleSelectValue(serviceProvider: any) {
    serviceProvider.selected = !serviceProvider.selected;
    this.selectedProviderEvent.emit(serviceProvider);
  }
}
