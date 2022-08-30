/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';

/**
 * Create Client Component
 */
@Component({
  selector: 'mifosx-client-general-step',
  templateUrl: './client-general-step.component.html',
  styleUrls: ['./client-general-step.component.scss']
})
export class ClientGeneralStepComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();

  /** Client Template */
  @Input() clientTemplate: any;
  /** Create Client Form */
  createClientForm: FormGroup;

  /** Office Options */
  officeOptions: any;
  /** Staff Options */
  staffOptions: any;
  /** Legal Form Options */
  legalFormOptions: any;
  /** Client Type Options */
  clientTypeOptions: any;
  /** Client Classification Options */
  clientClassificationTypeOptions: any;
  /** Business Line Options */
  businessLineOptions: any;
  /** Constitution Options */
  constitutionOptions: any;
  /** Gender Options */
  genderOptions: any;
  /** Saving Product Options */
  savingProductOptions: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {Dates} dateUtils Date Utils
   * @param {SettingsService} settingsService Setting service
   */
  constructor(private formBuilder: FormBuilder,
              private dateUtils: Dates,
              private settingsService: SettingsService) {
    this.setClientForm();
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.setOptions();
    this.buildDependencies();
  }

  /**
   * Creates the client form.
   */
  setClientForm() {
    this.createClientForm = this.formBuilder.group({
      'officeId': ['', Validators.required],
      'staffId': [''],
      'legalFormId': [''],
      'isStaff': [false],
      'active': [false],
      'addSavings': [false],
      'accountNo': [''],
      'externalId': [''],
      'genderId': [''],
      'mobileNo': [''],
      'emailAddress': ['', Validators.email],
      'dateOfBirth': [''],
      'clientTypeId': [''],
      'clientClassificationId': [''],
      'submittedOnDate': ['']
    });
  }

  /**
   * Sets select dropdown options.
   */
  setOptions() {
    this.officeOptions = this.clientTemplate.officeOptions;
    this.staffOptions = this.clientTemplate.staffOptions;
    this.legalFormOptions = this.clientTemplate.clientLegalFormOptions;
    this.clientTypeOptions = this.clientTemplate.clientTypeOptions;
    this.clientClassificationTypeOptions = this.clientTemplate.clientClassificationOptions;
    this.businessLineOptions = this.clientTemplate.clientNonPersonMainBusinessLineOptions;
    this.constitutionOptions = this.clientTemplate.clientNonPersonConstitutionOptions;
    this.genderOptions = this.clientTemplate.genderOptions;
    this.savingProductOptions = this.clientTemplate.savingProductOptions;
  }

  /**
   * Adds controls conditionally.
   */
  buildDependencies() {
    this.createClientForm.get('legalFormId').valueChanges.subscribe((legalFormId: any) => {
      if (legalFormId === 1) {
        this.createClientForm.removeControl('fullname');
        this.createClientForm.removeControl('clientNonPersonDetails');
        this.createClientForm.addControl('firstname', new FormControl('', [Validators.required, Validators.pattern('(^[A-z]).*')]));
        this.createClientForm.addControl('middlename', new FormControl('', Validators.pattern('(^[A-z]).*')));
        this.createClientForm.addControl('lastname', new FormControl('', [Validators.required, Validators.pattern('(^[A-z]).*')]));
      } else {
        this.createClientForm.removeControl('firstname');
        this.createClientForm.removeControl('middlename');
        this.createClientForm.removeControl('lastname');
        this.createClientForm.addControl('fullname', new FormControl('', [Validators.required, Validators.pattern('(^[A-z]).*')]));
        this.createClientForm.addControl('clientNonPersonDetails', this.formBuilder.group({
          'constitutionId': ['', Validators.required],
          'incorpValidityTillDate': [''],
          'incorpNumber': [''],
          'mainBusinessLineId': [''],
          'remarks': ['']
        }));
      }
    });
    this.createClientForm.get('legalFormId').patchValue(1);
    this.createClientForm.get('active').valueChanges.subscribe((active: boolean) => {
      if (active) {
        this.createClientForm.addControl('activationDate', new FormControl('', Validators.required));
      } else {
        this.createClientForm.removeControl('activationDate');
      }
    });
    this.createClientForm.get('addSavings').valueChanges.subscribe((active: boolean) => {
      if (active) {
        this.createClientForm.addControl('savingsProductId', new FormControl('', Validators.required));
      } else {
        this.createClientForm.removeControl('savingsProductId');
      }
    });
  }

  /**
   * Client General Details
   */
  get clientGeneralDetails() {
    const generalDetails = this.createClientForm.value;
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    for (const key in generalDetails) {
      if (generalDetails[key] === '' || key === 'addSavings') {
        delete generalDetails[key];
      }
    }
    if (generalDetails.submittedOnDate instanceof Date) {
      generalDetails.submittedOnDate = this.dateUtils.formatDate(generalDetails.submittedOnDate, dateFormat);
    }
    if (generalDetails.activationDate instanceof Date) {
      generalDetails.activationDate = this.dateUtils.formatDate(generalDetails.activationDate, dateFormat);
    }
    if (generalDetails.dateOfBirth instanceof Date) {
      generalDetails.dateOfBirth = this.dateUtils.formatDate(generalDetails.dateOfBirth, dateFormat);
    }

    if (generalDetails.clientNonPersonDetails && generalDetails.clientNonPersonDetails.incorpValidityTillDate) {
      generalDetails.clientNonPersonDetails = {
        ...generalDetails.clientNonPersonDetails,
        incorpValidityTillDate: this.dateUtils.formatDate(generalDetails.dateOfBirth, dateFormat),
        dateFormat,
        locale
      };
    }
    return generalDetails;
  }

}