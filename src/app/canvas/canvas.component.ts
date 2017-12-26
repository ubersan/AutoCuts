import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';

import { ElectronService } from 'ngx-electron';

import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
})
export class CanvasComponent implements OnInit {
  @ViewChild('canvas3dContainer') canvas3dContainer: ElementRef;
  @ViewChild('canvas2dContainer') canvas2dContainer: ElementRef;

  mesh: any;

  modelGeometry: any;
  modelMaterial: any;
  modelMesh: any;
  
  wireframeMesh: any;

  camera: any;

  renderer: any;
  renderer2d: any;
  
  scene: any;
  controls: any;

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

    this.views = [
      {
        left: 0,
        top: 0,
        width: 0.5,
        height: 1.0,
        background: new THREE.Color(0.5, 0.5, 0.7),
        eye: [0, 0, 100],
        up: [0, 1, 0],
        fov: 30
      },
      {
        left: 0.5,
        top: 0.5,
        width: 0.5,
        height: 1.0,
        background: new THREE.Color(0.8, 0.3, 0.2),
        eye: [0, 0, 100],
        up: [0, 1, 0],
        fov: 30
      }
    ]
  }

  hey(i) {
    console.log('hey', i);
  }

  ngOnInit() {
    this.init();
    this.animate();
  }

  ngAfterViewInit() {
    this.renderer.setSize(window.innerWidth / 2, window.innerHeight * 0.8);
    this.renderer2d.setSize(window.innerWidth / 2, window.innerHeight * 0.8);

    this.canvas3dContainer.nativeElement.appendChild(this.renderer.domElement);
    this.canvas2dContainer.nativeElement.appendChild(this.renderer2d.domElement);
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
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.z = 100;

    this.modelMaterial = new THREE.MeshPhongMaterial( {
      color: 0xff0000,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });

    var bunnyMesh = myAddon.loadBunny(this.meshFileName);
  
    var numVertices = bunnyMesh[0][0];
    var numFaces = bunnyMesh[0][1];

    this.modelGeometry = new THREE.Geometry();
    for (var i = 0; i < numVertices; ++i) {
      var v = bunnyMesh[i + 1];
      this.modelGeometry.vertices.push(new THREE.Vector3(v[0]*100, v[1]*100, v[2]*100));
    }

    for (var i = 0; i < numFaces; ++i) {
      var f = bunnyMesh[i + 1 + numVertices];
      this.modelGeometry.faces.push(new THREE.Face3(f[0], f[1], f[2]));
    }

    this.modelGeometry.computeFaceNormals();
    this.modelGeometry.computeVertexNormals();    

    var geo = new THREE.EdgesGeometry( this.modelGeometry ); // or WireframeGeometry
    var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1 } );
    this.wireframeMesh = new THREE.LineSegments( geo, mat );

    this.light = new THREE.AmbientLight(0xffffff);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

    this.createScene();
  }

  @HostListener('window:resize') onResize() {
    this.camera.aspect = (window.innerWidth / 2) / (window.innerHeight * 0.8);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth / 2, window.innerHeight * 0.8);
    this.renderer2d.setSize(window.innerWidth / 2, window.innerHeight * 0.8);
  }

  createScene() {
    this.scene = new THREE.Scene();

    this.mesh = new THREE.Mesh(this.modelGeometry, this.modelMaterial);
    if (this.showWireframe) {
      this.mesh.add(this.wireframeMesh);
    }
    this.scene.add(this.mesh);

    this.scene.add(this.light);
    this.scene.add(new THREE.AxesHelper(20));
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.renderer.render(this.scene, this.camera);
    this.renderer2d.render(this.scene, this.camera);
  }

}
