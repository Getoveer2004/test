import { Injectable } from '@angular/core';
import { Member } from './member';
import { MEMBERS } from './mock-members';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders, HttpParams  } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Kensaku } from './kensaku';
import { Player } from './player';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private membersUrl = 'api/members';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };

  private heroesUrl = 'http://localhost/SamplePHP/sample.php';

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) { }

   /** サーバーからヒーローを取得する */
   getHeroes(): Observable<Member[]> {
    return this.http.get<Member[]>(this.heroesUrl)
      .pipe(
        tap(heroes => this.log('fetched heroes')),
        catchError(this.handleError<Member[]>('getHeroes', []))
      );
  }

   /** IDによりヒーローを取得する。idが見つからない場合は`undefined`を返す。 */
   getHeroNo404<Data>(id: number): Observable<Member> {
    const url = `${this.heroesUrl}/?id=${id}.get`;
    return this.http.get<Member[]>(url)
      .pipe(
        map(heroes => heroes[0]), // {0|1} 要素の配列を返す
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Member>(`getHero id=${id}`))
      );
  }

  /** IDによりヒーローを取得する。見つからなかった場合は404を返却する。 */
  getHero(id: number): Observable<Member> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Member>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Member>(`getHero id=${id}`))
    );
  }

  /* 検索語を含むヒーローを取得する */
  searchHeroes(term: string): Observable<Member[]> {
    if (!term.trim()) {
      // 検索語がない場合、空のヒーロー配列を返す
      return of([]);
    }
    const url = `${this.heroesUrl}/?name=${term}`;
    return this.http.get<Member[]>(url).pipe(
      tap(_ => this.log(`found heroes matching "${term}"`)),
      catchError(this.handleError<Member[]>('searchHeroes', []))
    );
  }

  //////// Save methods //////////

  /** POST: サーバーに新しいヒーローを登録する */
  addHero(hero: Member): Observable<Member> {
    const param = "json="+JSON.stringify(hero);
    return this.http.post<Member>(this.heroesUrl, param, this.httpOptions).pipe(
      tap((newHero: Member) => this.log(`added hero w/ id=${newHero.id}`)),
      catchError(this.handleError<Member>('addHero'))
    );
  }

  /** DELETE: サーバーからヒーローを削除 */
  deleteHero(hero: Member | number): Observable<Member> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Member>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Member>('deleteHero'))
    );
  }

  /** PUT: サーバー上でヒーローを更新 */
  //PUTの時は保存されたテキストデータをJSONでparseするので、POST時のようなパラメータの変換は不要。
  updateHero(hero: Member): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  /**
   * 失敗したHttp操作を処理します。
   * アプリを持続させます。
   * @param operation - 失敗した操作の名前
   * @param result - observableな結果として返す任意の値
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: リモート上のロギング基盤にエラーを送信する
      console.error(error); // かわりにconsoleに出力

      // TODO: ユーザーへの開示のためにエラーの変換処理を改善する
      this.log(`${operation} failed: ${error.message}`);

      // 空の結果を返して、アプリを持続可能にする
      return of(result as T);
    };
  }



  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.membersUrl)
      .pipe(
        tap(members => this.log('社員データを取得しました')),
        catchError(this.handleError<Member[]>('getMembers', []))
      );
  }

  getMember(id: number): Observable<Member> {
    const url = `${this.membersUrl}/${id}`;
    return this.http.get<Member>(url)
      .pipe(
        tap(_ => this.log(`社員データ(id=${id})を取得しました`)),
        catchError(this.handleError<Member>(`getMember id=${id}`))
      );
  }

  updateMember(member: Member): Observable<any> {
    return this.http.put(this.membersUrl, member, this.httpOptions)
      .pipe(
        tap(_ => this.log(`社員データ(id=${member.id})を変更しました`)),
        catchError(this.handleError<any>('updateMember'))
      );
  }

  addMember(member: Member): Observable<Member> {
    return this.http.post<Member>(this.membersUrl, member, this.httpOptions)
      .pipe(
        tap((newMember: Member) => this.log(`社員データ(id=${newMember.id})を追加しました`)),
        catchError(this.handleError<Member>('addMember'))
      );
  }

  deleteMember(member: Member | number): Observable<Member> {
    const id = typeof member === 'number' ? member : member.id;
    const url = `${this.membersUrl}/${id}`;

    return this.http.delete<Member>(url, this.httpOptions)
      .pipe(
        tap(_ => this.log(`社員データ(id=${id})を削除しました`)),
        catchError(this.handleError<Member>('deleteMember'))
      );
  }

  searchMembers(term: string): Observable<Member[]> {
    if (!term.trim()) {
      return of([]);
    }
    return this.http.get<Member[]>(`${this.membersUrl}/?name=${term}`)
      .pipe(
        tap(_ => this.log(`${term} にマッチする社員データが見つかりました`)),
        catchError(this.handleError<Member[]>('searchMember', []))
      );
  }

     /** POST: サーバーに新しいヒーローを登録する */
     search(hero: Kensaku): Observable<Player> {
      const param = "json="+JSON.stringify(hero);
      return this.http.post<Player>(this.heroesUrl, param, this.httpOptions).pipe(
        tap((newHero: Player) => this.log(`added hero`)),
        catchError(this.handleError<Player>('addHero'))
      );
    }

    getMembers2(hero: Kensaku): Observable<Player[]> {
      const data = { startDate: hero.startDate, endDate: hero.endDate  };
      const params = new HttpParams({ fromObject: data });
      return this.http.get<Player[]>(this.heroesUrl, {params: params})
        .pipe(
          tap(members => this.log('社員データを取得しました')),
          catchError(this.handleError<Player[]>('getMembers', []))
        );
    }

  private log(message: string) {
    this.messageService.add(`MemberService: ${message}`);
  }

ConvertToCSV(objArray, headerList, keyList) {
     let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
     let str = '';
     let row = '';
for (let index in headerList) {
         row += headerList[index] + ',';
     }
     row = row.slice(0, -1);
     str += row + '\r\n';
     for (let i = 0; i < array.length; i++) {
         let line = (i+1)+'';
         for (let index in keyList) {
            let head = keyList[index];
line += ',' + array[i][head];
         }
         str += line + '\r\n';
     }
     return str;
 }

}
