import { Component, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Profile } from '../../profile/profile';

import 'rxjs/add/operator/take';

import { NbProfileService, NbPrivilegesService, NbPopupsService, NbStuffService } from '../../nb-services';
import { PrivilegesOptions, NbRoutes, profileTypes, stuffTypes, StuffPrivilegesOptions, NbEditVars } from '../../nb-config';

import { dfltAvatar, PopupsVars } from '../../nb-config';

import { NbProfile } from '../../nb-models';

@Component({
  selector: 'nb-item',
  templateUrl: './nb-item.component.html'
})
export class NbItemComponent implements OnDestroy {

    itemToDisplay;

    @Input() set item(item){
        this.itemToDisplay = item;

        if (stuffTypes.indexOf(this.itemToDisplay.type) > -1){
            if (this.itemToDisplay.profile){
                this.getProfileFromStuff();
            }
        }else {
            this.setUserProfilePrivileges();

        }

    }

    public sort: string;
    public cardCss: string;
    public cardAvatarCss: string;
    public cardNameCss: string;
    public cardTitleCss: string;
    public cardContentCss: string;
    public cardFooterCss: string;

    @Input() set sortOfCard(sortOfCard) {
        this.sort = sortOfCard;
        this.cardCss = 'card--'+sortOfCard;
        this.cardAvatarCss = 'card--'+sortOfCard+'__avatar';
        this.cardNameCss = 'card--'+sortOfCard+'__name';
        this.cardTitleCss = 'card--'+sortOfCard+'__title';
        this.cardContentCss = 'card--'+sortOfCard+'__content';
        this.cardFooterCss = 'card__footer card--'+sortOfCard+'__footer';
    }    
   
    private _subscriptions: Subscription[] = [];

    public visible:boolean = false;
    public editable:boolean = false;
    public contribute:boolean = false;
    public comment:boolean = false;

    public EditVars = NbEditVars;

    private _privileges: string[];
    public profile: Profile;

    public socialStats = [];

    private _nbProfileService: NbProfileService;
    private _nbStuffService: NbStuffService;
    private _nbPrivilegesService: NbPrivilegesService;
    private _nbPopupsService: NbPopupsService;
        
    constructor(
        private nbProfileService: NbProfileService,
        private nbStuffService: NbStuffService,
        private nbPrivilegesService: NbPrivilegesService,
        private nbPopupsService: NbPopupsService,
        private _router: Router
    ) { 
        this._nbProfileService = nbProfileService;
        this._nbStuffService = nbStuffService;
        this._nbPrivilegesService = nbPrivilegesService;
        this._nbPopupsService = nbPopupsService;
    }

    getProfileFromStuff(){
        this._subscriptions.push(
            this._nbProfileService.getProfileInfo({id:this.itemToDisplay.profile})
                .subscribe((profile: NbProfile) => {
                    this.profile = profile;
                    this.setUserProfilePrivileges();
                })
        )
        
    }

    setUserProfilePrivileges(){

        if (profileTypes.indexOf(this.itemToDisplay.type) > -1){

            this._privileges = this._nbPrivilegesService.getPrivileges(this.itemToDisplay);

            this.visible = (this._privileges.indexOf(PrivilegesOptions.view) > -1)? true : false;
            this.editable = (this._privileges.indexOf(PrivilegesOptions.editProfile) > -1)? true : false;

        }else if(stuffTypes.indexOf(this.itemToDisplay.type) > -1){

            this._privileges = this._nbPrivilegesService.getStuffPrivileges(this.itemToDisplay, this.profile);

            this.visible = (this._privileges.indexOf(StuffPrivilegesOptions.view) > -1)? true : false;
            this.editable = (this._privileges.indexOf(StuffPrivilegesOptions.edit) > -1)? true : false;
            this.contribute = (this._privileges.indexOf(StuffPrivilegesOptions.contribute) > -1)? true : false;
            this.comment = (this._privileges.indexOf(StuffPrivilegesOptions.comment) > -1)? true : false;


        }

    }

    getAvatar(){
        if (this.itemToDisplay && this.itemToDisplay.avatar){
            return this.itemToDisplay.avatar;
        }
        return dfltAvatar[this.itemToDisplay.type];
    }


    editItem(){

        if(this.itemToDisplay && this.itemToDisplay.id && profileTypes.indexOf(this.itemToDisplay.type) > -1){

            this._nbProfileService.setProfile({id:this.itemToDisplay.id}, 'user')
                .take(1)
                .subscribe(res => {
                    this._nbProfileService.setUserProfileToEdit();
                    this._router.navigate([NbRoutes.editProfile])
                });
            
        }else if(stuffTypes.indexOf(this.itemToDisplay.type) > -1){

            this._nbStuffService.setStuffToEdit(this.itemToDisplay);
            this._nbPopupsService.openPopup(PopupsVars.editNewStuffPopupOptions)
        }
    }
    ngOnDestroy(){
        this._subscriptions.forEach(sub => sub.unsubscribe())
    }

}
