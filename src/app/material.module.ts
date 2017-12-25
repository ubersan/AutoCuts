import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatSidenavModule
} from '@angular/material';

@NgModule({
    imports: [ MatButtonModule, MatMenuModule, MatIconModule, MatToolbarModule, MatCheckboxModule, MatSidenavModule ],
    exports: [ MatButtonModule, MatMenuModule, MatIconModule, MatToolbarModule, MatCheckboxModule, MatSidenavModule ]
})
export class MaterialModule {}