import {Component, Input} from '@angular/core';
import * as fhir from "@fhir-typescript/r4-core/src/fhir";

@Component({
    selector: 'app-telecom',
    templateUrl: './telecom.component.html',
    styleUrls: ['./telecom.component.scss'],
    standalone: false
})
export class TelecomComponent  {
  @Input() telecom: fhir.ContactPoint[];

  toTitleCase(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
