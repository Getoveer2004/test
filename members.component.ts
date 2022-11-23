import { Component } from '@angular/core';
import { Member } from '../member';
import { MemberService } from '../member.service';
import { MessageService } from '../message.service';
import { FormGroup,FormBuilder,Validators,AbstractControl,ValidationErrors} from '@angular/forms';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { Kensaku } from '../kensaku';
import { Player } from '../player';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent {

  members: Member[];
  players: Player[];
  name = "";
  kana = "";
  reactiveForm:FormGroup;
  headerList: any[] = new Array();

  jsonData =  [
    {
      name: "Anil Singh",
      age: 33,
      average: 98,
      approved: true,
      description: "I am active blogger and Author."
    },
    {
      name: 'Reena Singh',
      age: 28,
      average: 99,
      approved: true,
      description: "I am active HR."
    },
    {
      name: 'Aradhya',
      age: 4,
      average: 99,
      approved: true,
      description: "I am engle."
    },
  ];

  constructor(private memberService: MemberService,private fb:FormBuilder,
    dateAdapter: DateAdapter<NativeDateAdapter>,
    private datePipe: DatePipe) {
      dateAdapter.setLocale('ja-JP');
    this.reactiveForm = this.fb.group({
      kana:["",],
      name:["",],
      kikan1:['',],
      kikan2:['',],
      favorite:["ケーキ"],
      gender:["男",],
      birth:["",],
      pet:[null,]
    });


   }

  ngOnInit(): void {
    this.getMembers();
  }

  getMembers(): void {
    this.memberService.getHeroes() // Observable
      .subscribe(members => this.members = members);
  }

  add(name: string): void {
    name = name.trim();
    if (!name) { return; }
    this.memberService.addHero({ name } as Member)
      .subscribe(member => {
        this.members.push(member);
      });
  }

  delete(member: Member): void {
    this.members = this.members.filter(m => m !== member);
    this.memberService.deleteHero(member).subscribe();
  }

  ctrl(name:string){
    return this.reactiveForm.controls[name];
  }

  output(){
    console.log(this.reactiveForm.value);
    console.log(this.reactiveForm.getRawValue());
    console.log(this.reactiveForm.controls["name"].value);
    console.log(this.reactiveForm.controls["kana"].value);
    console.log(this.datePipe.transform(this.reactiveForm.controls["kikan1"].value, 'yyyy/MM/dd H:mm:ss'));

    let startDate = this.datePipe.transform(this.reactiveForm.controls["kikan1"].value, 'yyyy/MM/dd H:mm:ss')
    let changeDate = this.datePipe.transform(this.reactiveForm.controls["kikan2"].value, 'yyyy/MM/dd H:mm:ss');
    var dt = new Date(changeDate);
    let endDate = this.datePipe.transform(dt.setDate((dt.getDate() + 1)),'yyyy/MM/dd H:mm:ss');
    console.log('変換後：' + changeDate);
    console.log('開始：'+ startDate);
    console.log('終了：'+ endDate);

    // this.memberService.search({startDate: startDate, endDate: endDate})
    // .subscribe(players => this.players = players);

    this.memberService.getMembers2({startDate: startDate, endDate: endDate})
    .subscribe(players => this.players = players
      );

      console.log(this.players.length);
      console.log(JSON.stringify(this.players));

      this.downloadFile(JSON.stringify(this.players), 'jsontocsv')

      // this.memberService.downloadFile(this.jsonData, 'jsontocsv');
  }

  dirtyAndNull(ctrl: AbstractControl): ValidationErrors | null{
    if(ctrl.dirty && !ctrl.value){
      return {'dirtyAndNull':true};
    }else{
      return null;
    }
  }

  downloadFile(data, filename='data') {
    let csvData = this.memberService.ConvertToCSV(data, ['ID','選手名', '国名', 'クラブ名', 'ポジション','番号','誕生日','身長','体重'],['playerId','playerName','countryName','club','position','uniformNum','birth','height','weight']);
    console.log('csvデータ：' + csvData)
    let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
        dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
}  
}

