import { Injectable } from '@angular/core'

@Injectable()

export class FhirTerminologyConstants{

  // https://terminology.hl7.org/3.1.0/CodeSystem-v3-EducationLevel.html
  EDUCATION_LEVEL = [
    {
      "code": "ASSOC",
      "display": "Associate's or technical degree complete",
      "definition": "Associate's or technical degree complete"
    },
    {
      "code": "BD",
      "display": "College or baccalaureate degree complete",
      "definition": "College or baccalaureate degree complete",
    },
    {
      "code": "ELEM",
      "display": "Elementary School",
      "definition": "Elementary School",
    },
    {
      "code": "GD",
      "display": "Graduate or professional Degree complete",
      "definition": "Graduate or professional Degree complete",
    },
    {
      "code": "HS",
      "display": "High School or secondary school degree complete",
      "definition": "High School or secondary school degree complete",
    },
    {
      "code": "PB",
      "display": "Some post-baccalaureate education",
      "definition": "Some post-baccalaureate education",
    },
    {
      "code": "POSTG",
      "display": "Doctoral or post graduate education",
      "definition": "Doctoral or post graduate education",
    },
    {
      "code": "SCOL",
      "display": "Some College education",
      "definition": "Some College education",
    },
    {
      "code": "SEC",
      "display": "Some secondary or high school education",
      "definition": "Some secondary or high school education",
    }
  ]

  // https://terminology.hl7.org/3.1.0/ValueSet-v3-employmentStatusODH.html
  EMPLOYMENT_STATUS = [
    {
      "code": "Employed",
      "display": "Employed",
      "definition": "Individuals who, during the last week: a) did any work for at least 1 hour as paid or unpaid " +
        "employees of a business or government organization; worked in their own businesses, professions, or on their " +
        "own farms; or b) were not working, but who have a job or business from which the individual was temporarily " +
        "absent because of vacation, illness, bad weather, childcare problems, maternity or paternity leave, " +
        "labor-management dispute, job training, or other family or personal reasons, regardless of whether or not " +
        "they were paid for the time off or were seeking other jobs.",
    },
    {
      "code": "NotInLaborForce",
      "display": "Not In Labor Force",
      "definition": "Persons not classified as employed or unemployed, meaning those who have no job and are not " +
        "looking for one.",
    },
    {
      "code": "Unemployed",
      "display": "Unemployed",
      "definition": "Persons who currently have no employment, but are available for work and have made specific " +
        "efforts to find employment.",
    }

  ]

}
