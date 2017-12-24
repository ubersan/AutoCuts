import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    MatCheckboxModule
} from '@angular/material';

@NgModule({
    imports: [ MatButtonModule, MatMenuModule, MatIconModule, MatToolbarModule, MatCheckboxModule ],
    exports: [ MatButtonModule, MatMenuModule, MatIconModule, MatToolbarModule, MatCheckboxModule ]
})
export class MaterialModule {}