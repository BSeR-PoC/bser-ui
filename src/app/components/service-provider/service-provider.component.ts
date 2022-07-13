import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-service-provider',
  templateUrl: './service-provider.component.html',
  styleUrls: ['./service-provider.component.scss']
})
export class ServiceProviderComponent implements OnInit {

  @Input() serviceProvider: any;
  @Output() updateSelectedValueEvent = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  onToggleSelectValue(serviceProvider: any) {
    serviceProvider.selected = !serviceProvider.selected;
    this.updateSelectedValueEvent.emit(serviceProvider);
  }

}
