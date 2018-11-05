import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { Profile } from '../profile/profile';

import { NbProfileService, NbStuffService, NbLangsService } from '../nb-services';

import { NbProfile, NbList } from '../nb-models';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

import { socialLists } from '../nb-config'

@Component({
  selector: 'nb-items-list',
  templateUrl: './nb-items-list.component.html'
})
export class NbItemsListComponent implements OnInit, OnDestroy {
 
    @Input() set list(list){

        this.name = list.name;
        this.typeOfItems = list.type;
        
        if (socialLists.indexOf(list.id)>-1){

            this.setSocialList(list);
        }else{

            this.setListFromId(list.id);

        }
    }

    @Input() set items (items){
        this.itemsList = items
    }

    @Input() set type(type: string){
        this.typeOfItems = type;
        this.nameFromType = type + 's';
    }

    @Input() sortOfCard: string = 'md';

    cardClass = {
        'xs':'card--xs',
        'sm':'card--sm',
        'md':'card--md',
        'lg':'card--lg',
        'xl':'card--xl'

    }
    public lang: string;

    typeOfItems: string;
    name: string;
    nameFromType: string='';
    userProfile: NbProfile;
 
    itemsListClass: string;
    view: string | null;
    
    public itemsList;
    
    private _subscriptions: Subscription[] = [];

    private _nbProfileService: NbProfileService;
    private _nbStuffService: NbStuffService;
    private _nbLangsService: NbLangsService;

    constructor(
        nbProfileService: NbProfileService,
        nbStuffService: NbStuffService,
        nbLangsService: NbLangsService
    ) {
        this._nbProfileService = nbProfileService;
        this._nbStuffService = nbStuffService;
        this._nbLangsService = nbLangsService;
    }


    ngOnInit() {
        this.itemsListClass = 'items-list';
        this._nbLangsService.lang$.subscribe(lang => this.lang = lang);
       
    }

    changeView(action?): void{
        if (action == 'full') {
            this.itemsListClass = 'items-list-full';
            this.view = 'full';
        }else {
            this.itemsListClass = 'items-list';
            this.view = null;

        }
    }
  
    setSocialList(list: NbList): void{
        if (list.type){
            this._subscriptions.push(
                this._nbProfileService.getProfileSocialDetails(list.type, list.id)
                    .subscribe((socialDetails) =>  {
                        this.typeOfItems = list.type;
                        this.setItems(socialDetails);
                    })
            )
            
        }
            
    }

    setListFromId(listId: string): void{

        this._subscriptions.push(
            this._nbProfileService.getProfile()
                .map((profile: NbProfile) => {
                    if (profile && profile.id){
                        this.setItemsFromList(listId, profile); 
                    }
                    
                })
                .subscribe()
        )
    }

    setItemsFromList(listId, profile): void{
        
        this._subscriptions.push(
            this._nbProfileService.getItemsFromProfileList(listId, profile.id)
                .take(1)
                .subscribe((items:any) => {
                    if (items && items.length>0){

                        this.setItems(items);
                    }

                }) 
        )
        
    }
    setItems(items):void {

        this.itemsList = [];
        if (this.typeOfItems && this.typeOfItems == 'profile'){

            for(let item of items){

                const banned = this._nbProfileService.checkIfBanned(item);

                if (!banned){

                    this._subscriptions.push(
                        this._nbProfileService.getProfileInfo({id:item.id})
                            .take(1)
                            .subscribe((profile) => {
                                if (profile && profile.id && (profile.type == 'profile' || profile.type == 'event')){
                                    this.itemsList.push(profile);
                                }
                            }) 
                    )
                }
                
            }
            
        }else if (this.typeOfItems && this.typeOfItems == 'stuff'){
            for(let item of items){

                const viewed = this._nbProfileService.checkIfViewed(item);

                if (!viewed){
                    this._subscriptions.push(
                        this._nbStuffService.getStuffInfo({id:item.id})
                            .take(1)
                            .subscribe((stuff) => {
                                if (stuff){
                                   const banned = (stuff.profile)
                                        ?   this._nbProfileService.checkIfBanned({id:stuff.profile})
                                        :   false;

                                    if (!banned && stuff && stuff.id && (stuff.type == 'post' || stuff.type == 'list')){
                                        this.itemsList.push(stuff);
                                    } 
                                }
                                
                            }) 
                    )
                }   
            }
        }
    }

    ngOnDestroy(){
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }
   
}
