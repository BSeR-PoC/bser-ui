import { Pipe, PipeTransform } from '@angular/core';
import {FhirTerminologyConstants} from "../providers/fhir-terminology-constants";
@Pipe({
  name: 'serviceType'
})
export class ServiceTypePipe implements PipeTransform {

  constructor( private fhirTerminologyConstants: FhirTerminologyConstants) {
  }

  transform(value: string): unknown {
    return this.fhirTerminologyConstants.SERVICE_TYPES.find(serviceType => serviceType.code === value).display
  }

}
