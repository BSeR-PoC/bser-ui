import { Injectable } from '@angular/core';
import {Parameters, ParametersParameter} from "@fhir-typescript/r4-core/dist/fhir/Parameters";
import {FhirString} from "@fhir-typescript/r4-core/dist/fhir/FhirString";

@Injectable({
  providedIn: 'root'
})
export class ParameterHandlerService {

  constructor() { }

  setResourceParameter(parametersResource: Parameters, name: string, resource: any): Parameters {
    // Find existing keys
    let exists = false;
    parametersResource.parameter.forEach((parameter: ParametersParameter) => {
      if (parameter.name.toString() === name) {
        parameter.resource = resource;
        exists = true;
      }
    });
    if (!exists) {
      parametersResource.parameter.push(new ParametersParameter({
        name: name,
        resource: resource
      }));
    }
    return parametersResource;
  }

  mapFormDataToParameters() {
    // TODO: Implement handling a discrete FormGroup (e.g. general, diabetes-prevention, etc) to a set of Params
    // HA1c, Weight, Height, BMI
    // {
    //   "name":
    // }
  }

  setStringParameter(parametersResource: Parameters, name: string, value: string): Parameters {
    parametersResource.parameter.push(new ParametersParameter({
      name: name,
      valueString: value
    }));
    return parametersResource;
  }

  // Todo: Add handling to check if valid code from API design.
  setCodeParameter(parametersResource: Parameters, name: string, value: string): Parameters {
    //If the parameter already exists, we need to filter it out. This way we know there are not duplicate parameters in the resource.
    parametersResource.parameter = parametersResource.parameter.filter(parameter => parameter.name.toString() !== name);

    //add parameter
    parametersResource.parameter.push(new ParametersParameter({
      name: name,
      valueCode: value
    }));
    return parametersResource;
  }

  removeParameterByName(parametersResource: Parameters, name: string | string[]): Parameters{
    if(!name || (Array.isArray(name) && name.length === 0) || parametersResource.parameter.length === 0){
      //Nothing to filter, just return the parametersResource
      return parametersResource
    }

    if(Array.isArray(name)){
      parametersResource.parameter = parametersResource.parameter.filter(parameter => name.indexOf(parameter.name.toString()) != -1);
    }
    else {
      parametersResource.parameter = parametersResource.parameter.filter(parameter => parameter.name.toString() !== name);
    }
    return parametersResource;
  }

}
