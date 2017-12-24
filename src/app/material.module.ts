import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule
} from '@angular/material';

@NgModule({
    imports: [ MatButtonModule, MatMenuModule, MatIconModule, MatToolbarModule ],
    exports: [ MatButtonModule, MatMenuModule, MatIconModule, MatToolbarModule ]
})
export class MaterialModule {}