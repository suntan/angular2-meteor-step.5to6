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
