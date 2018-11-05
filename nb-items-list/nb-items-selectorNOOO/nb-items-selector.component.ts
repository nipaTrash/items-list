import { Component} from '@angular/core';

@Component({
    selector:'nb-items-selector',
    templateUrl: './nb-items-selector.component.html'
})
export class NbItemsSelectorComponent{



    list = {
        name:{es:'la otra', en:'the other'},
        type:'profile',
        id:'following'
    }
}
