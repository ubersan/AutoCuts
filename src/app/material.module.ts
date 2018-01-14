import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatSelectModule,
    MatInputModule
} from '@angular/material';

@NgModule({
    imports: [ MatButtonModule, MatMenuModule, MatIconModule, MatToolbarModule, MatCheckboxModule, MatSidenavModule, MatSelectModule, MatInputModule ],
    exports: [ MatButtonModule, MatMenuModule, MatIconModule, MatToolbarModule, MatCheckboxModule, MatSidenavModule, MatSelectModule, MatInputModule ]
})
export class MaterialModule {}