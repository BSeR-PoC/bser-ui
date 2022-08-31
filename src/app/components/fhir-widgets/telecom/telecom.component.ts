import {Component, Input} from '@angular/core';
import * as fhir from "@fhir-typescript/r4-core/src/fhir";

@Component({
  selector: 'app-telecom',
  templateUrl: './telecom.component.html',
  styleUrls: ['./telecom.component.scss']
})
export class TelecomComponent  {
  @Input() telecom: fhir.ContactPoint[];
}
