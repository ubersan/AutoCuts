import { NgModule } from '@angular/core';

import {
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatSelectModule,
    MatInputModule,
    MatSliderModule
} from '@angular/material';

@NgModule({
    imports: [ MatButtonModule, MatMenuModule, MatIconModule, MatToolbarModule, MatCheckboxModule, MatSidenavModule, MatSelectModule, MatInputModule, MatSliderModule ],
    exports: [ MatButtonModule, MatMenuModule, MatIconModule, MatToolbarModule, MatCheckboxModule, MatSidenavModule, MatSelectModule, MatInputModule, MatSliderModule ]
})
export class MaterialModule {}