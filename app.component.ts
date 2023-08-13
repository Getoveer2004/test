import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { of, delay } from 'rxjs';

interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-root',
  // 対応するHTMLファイルのパス
  templateUrl: './app.component.html',
  // 対応するスタイルシートのパス
  styleUrls: ['./app.component.css'],
})　



export class AppComponent implements OnInit {

  public registerForm: FormGroup;
  public name: FormControl;
  public name2: FormControl;
  public address: FormControl;
  public phone: FormControl;
  public email: FormControl;
  public password: FormControl;
  public passwordConfirm: FormControl;
  public variable: boolean;
  public selectTest: FormControl;
  public selectTest2: FormControl;
  selectedValue: string;

  foods: Food[] = [
    {value: '1', viewValue: 'Steak'},
    {value: '2', viewValue: 'Pizza'},
    {value: '3', viewValue: 'Tacos'},
  ];

  constructor() {}

  ngOnInit(): void {
    this.name = new FormControl({value:'wata',disabled:true}, Validators.required);
    this.name2 = new FormControl('hironoobuだよ', Validators.required);
    // this.name2 = new FormControl('hironobu', Validators.required);
    this.address = new FormControl('', Validators.required);
    this.phone = new FormControl('', Validators.required);
    this.email = new FormControl('', Validators.required);
    this.password = new FormControl('', Validators.required);
    this.passwordConfirm = new FormControl('', Validators.required);
    this.selectTest = new FormControl({value:'3',disabled:true}, Validators.required);
    this.selectTest2 = new FormControl('1');
    this.variable = true;

    this.registerForm = new FormGroup({
      name: this.name,
      name2: this.name2,
      address: this.address,
      phone: this.phone,
      email: this.email,
      password: this.password,
      passwordConfirm: this.passwordConfirm,
      selectTest: this.selectTest,
      selectTest2: this.selectTest2
    });
  }
  test() {
    // TypeError: Cannot read property 'id' of undefined
    return [].find(_ => false).id;
  }

  onSubmit() {
    console.log('クリック');
      console.log("フォームの値",this.registerForm);
  }

  undisabled() {
    console.log("disabledされました");
  }


}
