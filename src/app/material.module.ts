import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatSelectModule
} from '@angular/material';

@NgModule({
    imports: [ MatButtonModule, MatMenuModule, MatIconModule, MatToolbarModule, MatCheckboxModule, MatSidenavModule, MatSelectModule ],
    exports: [ MatButtonModule, MatMenuModule, MatIconModule, MatToolbarModule, MatCheckboxModule, MatSidenavModule, MatSelectModule ]
})
export class MaterialModule {}