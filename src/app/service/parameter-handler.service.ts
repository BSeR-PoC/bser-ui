import { Injectable } from '@angular/core';
import {Parameters, ParametersParameter} from "@fhir-typescript/r4-core/dist/fhir/Parameters";

@Injectable({
  providedIn: 'root'
})
export class ParameterHandlerService {

  constructor() { }

  addResourceParameter(parametersResource: Parameters, name: string, resource: any): Parameters {
    parametersResource.parameter.push(new ParametersParameter({
      name: name,
      resource: resource
    }));
    return parametersResource;
  }

  addStringParameter(parametersResource: Parameters, name: string, value: string): Parameters {
    parametersResource.parameter.push(new ParametersParameter({
      name: name,
      valueString: value
    }));
    return parametersResource;
  }
}
