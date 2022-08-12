import {Patient} from "@fhir-typescript/r4-core/dist/fhir/Patient";
import {Coding} from "@fhir-typescript/r4-core/dist/fhir/Coding";

export class USCorePatient extends Patient {
  race: Coding[];
  ethnicity: Coding[];

  constructor(patient: Patient) {
    super(patient);
    this.race = this.getRace(patient);
    this.ethnicity = this.getEthnicity(patient);
  }

  private getRace(patient: Patient) {
    if(!patient.extension || !patient.extension.length){
      return null;
    }
    const extension = patient.extension.find((extension: any) => extension.url === "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race");
    const ombCategoryExtensions = extension?.extension?.filter((extension: any) => extension.url === "ombCategory");
    return ombCategoryExtensions.map(ext => Object.assign(new Coding(), ext));
  }

  private getEthnicity(patient: Patient) {
    const extension = patient.extension.find((extension: any) => extension.url === "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity");
    const ombCategoryExtensions = extension?.extension?.filter((extension: any) => extension.url === "ombCategory");
    return ombCategoryExtensions.map(ext => Object.assign(new Coding(), ext));
  }
}
