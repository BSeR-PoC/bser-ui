import { Injectable } from '@angular/core';
import {Parameters, ParametersParameter} from "@fhir-typescript/r4-core/dist/fhir/Parameters";
import {Quantity} from "@fhir-typescript/r4-core/dist/fhir/Quantity";
import {patientParams} from "fhirclient/lib/settings";

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
    if(parametersResource.parameter){
      parametersResource.parameter = parametersResource.parameter.filter(parameter => parameter.name.toString() !== name);
    }
    else {
      parametersResource.parameter = [];
    }

    //add parameter
    parametersResource.parameter.push(new ParametersParameter({
      name: name,
      valueCode: value
    }));
    return parametersResource;
  }

  setValueQuantityParameter(parametersResource: Parameters, name: string, value: any, unit: string, system: string, code: string): Parameters {
    //If the parameter already exists, we need to filter it out. This way we know there are not duplicate parameters in the resource.
    if(parametersResource.parameter){
      parametersResource.parameter = parametersResource.parameter.filter(parameter => parameter.name.toString() !== name);
    }
    else {
      parametersResource.parameter = [];
    }

    const valueQuantity = new Quantity({value: value, unit: unit, system: system, code: code});
    parametersResource.parameter.push(new ParametersParameter({
      name: name,
      valueQuantity: valueQuantity
    }));
    return parametersResource;
  }

  //TODO currently handles only valueQuantity and valueDateTime
  setPartParameter(parametersResource: Parameters, name: string, partList: any[]): Parameters {
    //If the parameter already exists, we need to filter it out. This way we know there are not duplicate parameters in the resource.
    if(parametersResource.parameter){
      parametersResource.parameter = parametersResource.parameter.filter(parameter => parameter.name.toString() !== name);
    }
    else {
      parametersResource.parameter = [];
    }

    function getValue(part: any): any {
      if(part.valueQuantity) {
        return {value: part.valueQuantity.value, unit: part.valueQuantity.unit, system: part.valueQuantity.system, code: part.valueQuantity.code};
      }
      if(part.valueDateTime) {
        return new Date(part.valueDateTime)
      }
    }

    // TODO: make this function safer
    // Helper function to extract the type of the entity (valueCode, valueDate, valueQuantity)
    // Note that this function returns any key different from "name". This is brittle, because it may return a key "foo",
    // if such key exist
    function getKey(part) {
      return Object.keys(part).find(key => key !== 'name');
    }

    // We are just mapping the data to a
    const mapped: any = partList
      .map(part => {
        let obj: any = {};
        obj[getKey(part)] = getValue(part);
        obj.name = part.name;
      return obj
      })
      .map(obj =>{
        if(obj.valueQuantity){
          const valueQuantity =  new Quantity(obj.valueQuantity);
          return new ParametersParameter({name: obj.name, valueQuantity: valueQuantity});
        }
        else if (obj.valueDateTime){
          return new ParametersParameter({name: obj.name, valueDateTime: obj.valueDateTime});
        }
        //We only handle valueDateTime and valueQuantity for now.
        console.error("Unable to determine object type")
        return null;
      });

    const result = new ParametersParameter({
      name: name,
      part: mapped
    });

    parametersResource.parameter.push(result);

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
