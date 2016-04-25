# angular2-meteor-step.5to6
安裝 Meteor 指令如下:

$ curl https://install.meteor.com/ | sh

下載範例到專案根目錄，以　/usr/src 為例，並變更專案名稱 (以 my-app 為例 )，輸入指令如下 :

$ cd /usr/scr

$ git clone https://github.com/suntan/angular2-meteor-step.1to3.git

$ mv angular2-meteor-step.1to3 my-app

$ cd my-app

$ meteor add angular2-compilers

$ meteor npm install --save angular2-meteor

$ meteor npm install --save meteor-node-stubs

$ meteor remove blaze-html-templates

$ npm install typings -g

$ typings install es6-promise

$ typings install es6-shim --ambient

$ meteor npm install angular2-meteor-auto-bootstrap --save


用自己喜歡的 port 啟動(以下用1688為例)，輸入指令如下:

$ meteor -p  1688

=============================================================================================

Step 5 - Routing & Multiple Views 

本節學習重點，從此節開始；較為重要的觀念項目才使用中文說明，其他則保留原文的陳述 :

1.	how to create a layout template

2.	how to build an app that has multiple views with the new Angular router.

# Import Router Dependencies

Angular2-Meteor 套件已經包含了 Angular 2 的 angular2/router　無須另外安裝，針對 angular2/router　有三項必知項目如下:

1.	ROUTER_PROVIDERS : 路由服務提供者

2.	ROUTER_DIRECTIVES : 路由指令

3.	RouteConfig : 路由設定

我們可以這樣的理解這三者是連動協作的關係，首先須定義RouteConfig 並由ROUTER_PROVIDERS來進行裝載，然後由ROUTER_DIRECTIVES 觸發執行 RouteConfig 中定義的設定。

執行指令的地方是在編譯元組件的註釋(@Comppnent)執行，而 Providers 則是由 root component 在 bootstrap 時載入的同時對應到該元組件以載入其Tamplate / View。而 RouteConfig 的設定方式可以在 root component中進行宣告，稱之為[靜態路由設定]，也可以使用 @Injectable (注入器) 進行指令的指派，稱之為 [動態路由設定] 。

Angular 2 有其中一個特點叫做 Component Routing (組件路由)，我們接下來要將我們原本的client應用作一些改變，改成一個 Parties List(列表頁)，跟 P arty Details(結果頁)；然後在Root Component的Socially 類別中來作RouteConfig定義。

# Parties List 組件

列表頁的功能與原本的 client/app.ts、client/app.htnl 基本上是相同的，所以我們執行以下指令，將這兩個檔案複製到 client/imports/parties-list/ 並順便更名 :

$ cp client/app.ts client/imports/parties-list/parties-list.ts

$ cp client/app.html client/imports/parties-list/parties-list.html

因為路徑改變，所以讀取資料模型 (collections/parties.ts) 及組件的路徑也要變更，將client/ imports/parties-list/parties-list.ts　檔案的Parties與PartiesForm修改如下：

import {Parties} from '../../../collections/parties.ts';

import {PartiesForm} from '../parties-form/parties-form.ts';

設定Parties List的路由，並將其URL 設定為起始路由路徑 「/」，修改 client/app.ts 檔案如下:

import 'reflect-metadata';

import 'zone.js/dist/zone';

import {Component, provide} from 'angular2/core';

import {bootstrap} from 'angular2-meteor-auto-bootstrap';

import {ROUTER_PROVIDERS, ROUTER_DIRECTIVES, RouteConfig, APP_BASE_HREF} from 'angular2/router';

import {PartiesList} from './imports/parties-list/parties-list';

@Component({

  selector: 'app',
  
  templateUrl: 'client/app.html',
  
  directives: [ROUTER_DIRECTIVES]
  
})

@RouteConfig([

  { path: '/', as: 'PartiesList', component: PartiesList }
  
])

class Socially {}

bootstrap(Socially, [ROUTER_PROVIDERS, provide(APP_BASE_HREF, { useValue: '/' })] );

首先我們引入 angular2/core API的 provide及 angular2/router API的 APP_BASE_HREF ，並將其作為Privder帶入angular2-meteor-auto-bootstrap API 的 bootstrap 來啟動應用，並將啟動的預設路徑路由設為「/」。


然後我們引入 angular2/router API的 RouteConfig，並聲明「/」路由設定，且指定該路由的執行組件為Parties List。


Run-time流程 : Root Component 透過bootstrap讀取到帶入的Providers設定，並知曉上述設定的預設路由導向，並透過ROUTER_PROVIDERS 與編譯組建中 directives 的設定讀取 RouteConfig來執行預設路由「/」，最終找到應到的執行組件為Parties List。

將原本的 client/app.html 修改如下 :
<router-outlet></router-outlet>

Angular2 的router-outlet標籤會依照directives所對應的RouteConfig來載入控制項。現在可啟動應用進行測試看看。

# Party Details 組件

我們先假設結果頁的Router Name 是: 「/PartyDetails」且Roter Path是: 「/paty/ : partyId」，結果頁必須提供此組件Praty資料的ID，然後透過資料模型讀出並執行Data-Bind。我們修改client/ imports/ parties-list/ 組件，使用angular2/router API所提供的 RouterLink 指令達成這個功能，在client/ imports.parties-list/parties-list.ts 中引入RouterLink並帶入編譯指令集:

import 'reflect-metadata';

import {Component} from 'angular2/core';

import {Parties} from '../../../collections/parties';

import {PartiesForm} from '../parties-form/parties-form';

import {RouterLink} from 'angular2/router';

@Component({

  selector: 'parties-list',
  
  templateUrl: '/client/imports/parties-list/parties-list.html',
  
  directives: [PartiesForm, RouterLink]
  
})

export class PartiesList {

  parties: Mongo.Cursor<Object>;

  constructor() {
  
    this.parties = Parties.find();
    
  }
  
  removeParty(party) {
  
    Parties.remove(party._id);
    
  }
  
}

修改client/parties-list/parties-list.html檔案，增加RouterLink帶入partyId :

<div>

  <parties-form></parties-form>
  
  <ul>
  
    <li *ngFor="#party of parties">
    
      <a [routerLink]="['/PartyDetails', {partyId: party._id}]">{{party.name}}</a>
      
      <p>{{party.description}}</p>
      
      <p>{{party.location}}</p>
      
      <button (click)="removeParty(party)">X</button>
      
    </li>
    
  </ul>
  
</div>

設定「/PartyDetails」路由，開啟 client/app.ts ，引入PartyDetails組件並於 @RouteConfig 區段增加路由設定 :

. . .

import {PartiesList} from './imports/parties-list/parties-list';

import {PartyDetails} from './imports/party-details/party-details';

@Component({

  selector: 'app',
  
  templateUrl: 'client/app.html',
  
  directives: [ROUTER_DIRECTIVES]
  
})

@RouteConfig([

  { path: '/', as: 'PartiesList', component: PartiesList },
  
  { path: '/party/:partyId', as: 'PartyDetails', component: PartyDetails }
  
])

建立 client/imports/party-details/party-details.ts 檔案，並寫入內容如下 :

import {Component} from 'angular2/core';

import {RouteParams} from 'angular2/router';

import {Parties} from '../../../collections/parties';

import {RouterLink} from 'angular2/router';

@Component({

  selector: 'party-details',
  
  templateUrl: '/client/imports/party-details/party-details.html',
  
  directives: [RouterLink]
  
})

export class PartyDetails {

  party: Object;
  
  constructor(params: RouteParams) {
  
    var partyId = params.get('partyId');
    
    this.party = Parties.findOne(partyId);
    
  }
  
}

首先引入 angular2/router API的 RouterParams，並使用其 .get(FieldName) 方法接收 partyId參數，並且帶入資料模型中此用 Meteor 代理的Mongo 物件的 findOne 提取資料物件並指派給區域變數 party 進行 Data-Bind。

再來引入 angular2/router API的RouterLink 帶入 Component.directives　供 View 套用 router-link。

建立 /client/imports/party-details/party-details.html檔案，並寫入內容如下 :

<header>

  <h2>{{party.name}}</h2>
  
  <p>{{party.description}}</p>
  
  <p>{{party.location}}</p>
  
  <a [routerLink]="['/PartiesList']">Go Back</a>
  
</header>

# Summary – 概要說明

1.	imports 資料夾是 Meteor 套用自開發組件的的目錄，需保留這一層不然會造成套件引入的錯亂。

2.	了解如何在組件頁中再崁入其他組件，如parties-list 中使用parties-form。

3.	將一個Page拆成兩個View ，並透過Routing 來實現。

4.	組件可以在多個地方進行呼叫使用；可專注開發單一組件的邏輯上，且易於維護。

# Step 6 - Bind one object

承上一節，實作資料更新功能，編輯 client/imports/party-details/party-details.html 如下:

<form (submit)="saveParty(party)">

  <label>Name</label>
  
  <input type="text" [(ngModel)]="party.name">

  <label>Description</label>
  
  <input type="text" [(ngModel)]="party.description">

  <label>Location</label>
  
  <input type="text" [(ngModel)]="party.location">

  <button type="submit">Save</button>
  
  <button [routerLink]="['/PartiesList']">Cancel</button>
  
</form>

將 View 改為一個form，並於submit時呼叫saveParty帶入 form Object 呼叫 saveParty 方法進行更新，光看以上Code 你可能會問 partyId 沒有在表單中；但請看仔細，Upate 的傳入參數是party 物件參數，是在這個View 帶進來的，所以我們沒必要再像以前寫 Asp.net 或 JSP一樣作 Case By ID的工作- - -我們傳輸的是 Object ;Binding也是使用 Object 好嗎?!

修改 client/imports/party-details/party-details.ts 增加 saveParty 方法，並傳入 run-time Object – party :

import 'reflect-metadata';

import {Component} from 'angular2/core';

import {RouteParams} from 'angular2/router';

import {Parties} from '../../../collections/parties';

import {RouterLink} from 'angular2/router';

@Component({

  selector: 'party-details',
  
  templateUrl: '/client/imports/party-details/party-details.html',
  
  directives: [RouterLink]
  
})

export class PartyDetails {

  party: Object;

  constructor(params: RouteParams) {
  
    var partyId = params.get('partyId');
    
    this.party = Parties.findOne(partyId);
    
  }

  saveParty(party) {
  
      Parties.update(party._id, {
      
        $set: {
        
          name: party.name,
          
          description: party.description,
          
          location: party.location
          
        }
        
      });
      
    }
    
}

# Summary – 概要說明

1.	使用Angular 2的[(ngModel)] 兩步快速 Data-Bind。

2.	使用資料模型快速更新資料。

