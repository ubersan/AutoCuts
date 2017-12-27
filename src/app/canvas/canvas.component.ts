import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';

import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
})
export class CanvasComponent implements OnInit {
  @ViewChild('sidenavcontent') sidenavcontent: ElementRef;
  //@ViewChild('canvas3dContainer') canvas3dContainer: ElementRef;
  //@ViewChild('canvas2dContainer') canvas2dContainer: ElementRef;

  mesh: any;

  modelGeometry: any;
  modelMaterial: any;
  modelMesh: any;
  
  wireframeMesh: any;

  camera: any;
  camera2d: any;

  renderer: any;
  renderer2d: any;
  
  scene: any;

  controls: any;
  controls2d: any;

  light: any;

  views: any;

  showWireframe = true;

  divWidth: any;

  // mesh to load on startup
  meshFileName = 'C:\\Users\\Sandro\\Documents\\libigl\\tutorial\\shared\\bunny.off';

  constructor(private _electronService: ElectronService) {
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.renderer2d = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer2d.setPixelRatio(window.devicePixelRatio);
  }

  ngOnInit() {
    this.init();
    this.animate();
  }

  // TODO: minus header bar
  verticalMinus = 0;

  ngAfterViewInit() {
    this.renderer.setSize(window.innerWidth / 2, window.innerHeight - this.verticalMinus);
    this.renderer2d.setSize(window.innerWidth / 2, window.innerHeight - this.verticalMinus);

    //this.canvas3dContainer.nativeElement.appendChild(this.renderer.domElement);
    //this.canvas2dContainer.nativeElement.appendChild(this.renderer2d.domElement);
    this.sidenavcontent.nativeElement.appendChild(this.renderer.domElement);
    this.sidenavcontent.nativeElement.appendChild(this.renderer2d.domElement);
  }

  toggleWireframe() {
    this.createScene();
  }

  loadMesh() {
    this._electronService.remote.dialog.showOpenDialog({
      properties: [ 'openFile' ],
      filters: [
        { name: 'OFF-Files', extensions: ['off'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    },
    files => this.callback_loadMesh(files));
  }

  callback_loadMesh(files: string[]) {
    // currently only OFF-Files are supported
    if (files && files[0].endsWith('.off')) {
      this.meshFileName = files[0];
      this.init();
    }
  }

  init() {
    this.camera = new THREE.PerspectiveCamera(40, (window.innerWidth / 2) / (window.innerHeight - this.verticalMinus), 1, 10000 );
    this.camera.position.z = 3;

    this.camera2d = new THREE.PerspectiveCamera(40, (window.innerWidth / 2) / (window.innerHeight - this.verticalMinus), 1, 10000 );
    this.camera2d.position.z = 3;

    this.modelMaterial = new THREE.MeshPhongMaterial( {
      color: 0xff0000,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });

    // TODO: Rename loadBunny to loadMesh
    var loadedMesh = myAddon.loadBunny(this.meshFileName);
  
    var numVertices = loadedMesh[0][0];
    var numFaces = loadedMesh[0][1];

    this.modelGeometry = new THREE.Geometry();
    for (var i = 0; i < numVertices; ++i) {
      var v = loadedMesh[i + 1];
      this.modelGeometry.vertices.push(new THREE.Vector3(v[0], v[1], v[2]));
    }

    for (var i = 0; i < numFaces; ++i) {
      var f = loadedMesh[i + 1 + numVertices];
      this.modelGeometry.faces.push(new THREE.Face3(f[0], f[1], f[2]));
    }

    this.modelGeometry.computeFaceNormals();
    this.modelGeometry.computeVertexNormals();
    this.modelGeometry.normalize();

    var geo = new THREE.EdgesGeometry( this.modelGeometry ); // or WireframeGeometry
    var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 0.1 } );
    this.wireframeMesh = new THREE.LineSegments( geo, mat );

    this.light = new THREE.AmbientLight(0xffffff);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls2d = new THREE.OrbitControls(this.camera2d, this.renderer2d.domElement);

    this.createScene();
  }

  @HostListener('window:resize') onResize() {
    this.camera.aspect = (window.innerWidth / 2) / (window.innerHeight - this.verticalMinus);
    this.camera.updateProjectionMatrix();

    this.camera2d.aspect = (window.innerWidth / 2) / (window.innerHeight - this.verticalMinus);
    this.camera2d.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth / 2, window.innerHeight - this.verticalMinus);
    this.renderer2d.setSize(window.innerWidth / 2, window.innerHeight - this.verticalMinus);

    console.log('innerwidth: ', window.innerWidth);
    console.log('innerheight: ', window.innerHeight);
  }

  createScene() {
    this.scene = new THREE.Scene();

    this.mesh = new THREE.Mesh(this.modelGeometry, this.modelMaterial);
    if (this.showWireframe) {
      this.mesh.add(this.wireframeMesh);
    }
    this.scene.add(this.mesh);

    this.scene.add(this.light);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.renderer.render(this.scene, this.camera);
    this.renderer2d.render(this.scene, this.camera2d);
  }

}
