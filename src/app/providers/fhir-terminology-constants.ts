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
  ];

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

  ];

  // https://hl7.org/fhir/us/core/STU3.1/ValueSet-omb-race-category.html
  RACE_CATEGORIES = [
    {
      "code": "1002-5",
      "system": "urn:oid:2.16.840.1.113883.6.238",
      "display": "American Indian or Alaska Native",
      "definition": "American Indian or Alaska Native",
    },
    {
      "code": "2028-9",
      "system": "urn:oid:2.16.840.1.113883.6.238",
      "display": "Asian",
      "definition": "Asian",
    },
    {
      "code": "2054-5",
      "system": "urn:oid:2.16.840.1.113883.6.238",
      "display": "Black or African American",
      "definition": "Black or African American",
    },
    {
      "code": "2076-8",
      "system": "urn:oid:2.16.840.1.113883.6.238",
      "display": "Native Hawaiian or Other Pacific Islander",
      "definition": "Native Hawaiian or Other Pacific Islander",
    },
    {
      "code": "2106-3",
      "system": "urn:oid:2.16.840.1.113883.6.238",
      "display": "White",
      "definition": "White",
    },
    {
      "code": "UNK",
      "system": "http://terminology.hl7.org/CodeSystem/v3-NullFlavor",
      "display": "Unknown",
      "definition": "Description:A proper value is applicable, but not known. Usage Notes: This means the actual value " +
        "is not known. If the only thing that is unknown is how to properly express the value in the necessary " +
        "constraints (value set, datatype, etc.), then the OTH or UNC flavor should be used. No properties should be " +
        "included for a datatype with this property unless: Those properties themselves directly translate to a semantic" +
        " of \"unknown\". (E.g. a local code sent as a translation that conveys 'unknown') Those properties further " +
        "qualify the nature of what is unknown. (E.g. specifying a use code of \"H\" and a URL prefix of \"tel:\" to " +
        "convey that it is the home phone number that is unknown.)",
    },
    {
      "code": "ASKU",
      "system": "http://terminology.hl7.org/CodeSystem/v3-NullFlavor",
      "display": "Asked but no answer",
      "definition": "Information was sought but not found (e.g., patient was asked but didn't know)",
    },
  ];

  // We are using the two core 2 OMB ethnicity categories
  // http://hl7.org/fhir/us/core/STU5/StructureDefinition-us-core-ethnicity.html
  ETHNICITY = [
    {
        "code": "2135-2",
        "system": "urn:oid:2.16.840.1.113883.6.238",
        "display": "Hispanic or Latino",
        "definition": "",
      },
      {
        "code": "2186-5",
        "system": "urn:oid:2.16.840.1.113883.6.238",
        "display": "Not Hispanic or Latino",
        "definition": "",
      },
      {
        "code": "ASKU",
        "system": "http://terminology.hl7.org/CodeSystem/v3-NullFlavor",
        "display": "Asked but unknown",
        "definition": "Information was sought but not found (e.g., patient was asked but didn't know)",
      },
      {
        "code": "UNK",
        "system": "http://terminology.hl7.org/CodeSystem/v3-NullFlavor",
        "display": "Unknown",
        "definition": "\t**Description:**A proper value is applicable, but not known. **Usage Notes**: This means the actual value is not known. If the only thing that is unknown is how to properly express the value in the necessary constraints (value set, datatype, etc.), then the OTH or UNC flavor should be used. No properties should be included for a datatype with this property unless: 1. Those properties themselves directly translate to a semantic of \"unknown\". (E.g. a local code sent as a translation that conveys 'unknown') 2. Those properties further qualify the nature of what is unknown. (E.g. specifying a use code of \"H\" and a URL prefix of \"tel:\" to convey that it is the home phone number that is unknown.)",
      }
  ];

  //http://hl7.org/fhir/us/core/STU3.1/ValueSet-us-core-observation-smokingstatus.html
  SMOKING_STATUS = [
    {"code": "449868002",         "display":	"Current every day smoker"},
    {"code": "428041000124106	",  "display":	"Current some day smoker"},
    {"code": "8517006",           "display":	"Former smoker"},
    {"code": "266919005",         "display":	"Never smoker"},
    {"code": "77176002",          "display":	"Smoker, current status unknown"},
    {"code": "266927001",         "display":	"Unknown if ever smoked"},
    {"code": "428071000124103",   "display":  "Current Heavy tobacco smoker"},
    {"code": "428061000124105",   "display":	"Current Light tobacco smoker"},
  ];


}
