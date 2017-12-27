import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';

import { ElectronService } from 'ngx-electron';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
})
export class CanvasComponent implements OnInit {
  @ViewChild('sidenavcontent') sidenavcontent: ElementRef;

  subscription: Subscription;

  mesh: any;

  modelGeometry: any;
  modelMaterial: any;

  selectMaterial: any;
  
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

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // mesh to load on startup
  meshFileName = 'C:\\Users\\Sandro\\Documents\\libigl\\tutorial\\shared\\bunny.off';

  // TODO: Read this out
  sideNavWidth = 103;

  hitfaceIndex = null;

  constructor(private _electronService: ElectronService) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.renderer2d = new THREE.WebGLRenderer({ antialias: true });
    this.renderer2d.setPixelRatio(window.devicePixelRatio);
  }

  ngOnInit() {
    this.init();
    this.animate();

    this.subscription = 
         Observable.fromEvent(
           this.renderer.domElement,
           'mousedown')
        .subscribe(e => {
          var mouseevent: MouseEvent;
          mouseevent = e as MouseEvent;
          this.mouse.x = ((mouseevent.clientX - this.sideNavWidth) / this.renderer.domElement.clientWidth) * 2 - 1;
          this.mouse.y = - (mouseevent.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
          console.log('mouse:', this.mouse);
          this.raycaster.setFromCamera(this.mouse, this.camera);

          var intersects = this.raycaster.intersectObjects(this.scene.children);
          if (intersects.length > 0) {
            this.hitfaceIndex = intersects[0].faceIndex;
            this.mesh.geometry.faces[this.hitfaceIndex].materialIndex = 1;
            this.mesh.geometry.groupsNeedUpdate = true;
            console.log('new hitfaceidx: ', this.hitfaceIndex);
          } else {
            this.hitfaceIndex = null;
          }
          console.log('#ints: ', intersects.length);
          console.log('ints: ', intersects);
        });
  }

  // TODO: minus header bar
  verticalMinus = 0;

  ngAfterViewInit() {
    this.renderer.setSize(window.innerWidth / 2, window.innerHeight - this.verticalMinus);
    this.renderer2d.setSize(window.innerWidth / 2, window.innerHeight - this.verticalMinus);

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
    this.camera = new THREE.PerspectiveCamera(40, (window.innerWidth / 2) / (window.innerHeight - this.verticalMinus), 0.001, 10000);
    this.camera.position.z = 3;

    this.camera2d = new THREE.PerspectiveCamera(40, (window.innerWidth / 2) / (window.innerHeight - this.verticalMinus), 0.001, 10000);
    this.camera2d.position.z = 3;

    this.modelMaterial = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });

    this.selectMaterial = new THREE.MeshPhongMaterial( {
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

    var geo = new THREE.EdgesGeometry(this.modelGeometry);
    var mat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1});
    this.wireframeMesh = new THREE.LineSegments(geo, mat);

    this.light = new THREE.AmbientLight(0xffffff);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls2d = new THREE.OrbitControls(this.camera2d, this.renderer2d.domElement);
    this.controls2d.enableRotate = false;

    this.createScene();
  }

  @HostListener('window:resize') onResize() {
    this.camera.aspect = (window.innerWidth / 2) / (window.innerHeight - this.verticalMinus);
    this.camera.updateProjectionMatrix();

    this.camera2d.aspect = (window.innerWidth / 2) / (window.innerHeight - this.verticalMinus);
    this.camera2d.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth / 2, window.innerHeight - this.verticalMinus);
    this.renderer2d.setSize(window.innerWidth / 2, window.innerHeight - this.verticalMinus);
  }

  createScene() {
    this.scene = new THREE.Scene();

    this.mesh = new THREE.Mesh(this.modelGeometry, [this.modelMaterial, this.selectMaterial]);
    if (this.showWireframe) {
      this.mesh.add(this.wireframeMesh);
    }
    this.scene.add(this.mesh);

    this.scene.add(this.light);

    this.scene.background = new THREE.Color(0xaeaeae);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // if (this.hitfaceIndex != null) {
    //   this.modelGeometry.faces[this.hitfaceIndex].material.color = new THREE.Color(0xff0000);
    //   console.log('face: ', this.modelGeometry.faces[this.hitfaceIndex]);
    //   console.log('changed it! ', this.hitfaceIndex)
    // }
    
    this.renderer.render(this.scene, this.camera);
    this.renderer2d.render(this.scene, this.camera2d);
  }

}
