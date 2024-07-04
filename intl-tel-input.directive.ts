import { Directive, ElementRef, HostListener, OnInit, OnDestroy, Output, Input, EventEmitter, forwardRef  } from '@angular/core';
import * as intlTelInput from 'intl-tel-input';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, AbstractControl, ValidationErrors  } from '@angular/forms';

@Directive({
  selector: '[appIntlTelInput]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IntlTelInputDirective),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => IntlTelInputDirective),
      multi: true
    }
  ]
})
export class IntlTelInputDirective implements OnInit, ControlValueAccessor, Validator {
  @Output() countryChange = new EventEmitter<any>();
  @Input('appIntlTelInput') defaultCountry:string = 'us';
  private iti: any;
  private onChange: any;
  private onTouched: any;
  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const input = this.el.nativeElement;
    this.iti = intlTelInput(input, {
      initialCountry: this.defaultCountry,
      preferredCountries: ['us', 'gb', 'ca'],
      separateDialCode: true,
      formatOnDisplay: false, // Disable format on display
      nationalMode: true, // Display the number in international format
      utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/19.0.2/js/utils.js'
    });

    input.addEventListener('countrychange', () => {
      const countryData = this.iti.getSelectedCountryData();
      this.countryChange.emit(countryData);
      this.onChange(input.value);
    });

    input.addEventListener('blur', () => {
      this.onTouched();
    });

    const countryData = this.iti.getSelectedCountryData();
    this.countryChange.emit(countryData);
  }
  ngOnDestroy() {
    this.iti.destroy();
  }

  @HostListener('input', ['$event'])
  onInput(event: any): void {    
    const input = event.target;
    const value = input.value.replace(/\D/g, ''); // Remove all non-numeric characters
    input.value = value;
    this.onChange(value);
  }

  writeValue(value: any): void {
    this.el.nativeElement.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const isValid = this.iti.isValidNumber();
    return isValid ? null : { invalidPhoneNumber: true };
  }

  setCountryCode(iso2: string) {
    if (this.iti) {
      this.iti.setCountry(iso2);
    }
  }

  setCountryCodeForElement(element: HTMLInputElement, iso2: string) {
    console.log('this trigger', iso2)
    const itiInstance = intlTelInput(element, {
        initialCountry: iso2,
        preferredCountries: ['us', 'gb', 'ca'],
        separateDialCode: true,
        formatOnDisplay: false,
        nationalMode: true,
        utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/19.0.2/js/utils.js'
    });
    itiInstance.setCountry(iso2);
  }
}
