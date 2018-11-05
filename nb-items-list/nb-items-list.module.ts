import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NbSocialStatsModule } from '../nb-social-stats/nb-social-stats.module';

import { NbComponentsModule } from '../nb-components/nb-components.module';

import { ReactiveFormsModule } from '@angular/forms';

import { JsNgTranslatorModule, JsNgBasicModule } from '../@js-lib';

import { NbItemsListComponent } from './nb-items-list.component';
import { NbItemComponent } from './nb-item/nb-item.component';


@NgModule({
    declarations:[ 
        NbItemsListComponent,
        NbItemComponent, 
    ],
    imports: [ 
        CommonModule, 
        ReactiveFormsModule,
        RouterModule,
        JsNgTranslatorModule,
        JsNgBasicModule,
        NbSocialStatsModule,
        NbComponentsModule,
    ],
    exports:[ 
        NbItemsListComponent
    ]
})
export class NbItemsListModule{ }