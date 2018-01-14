import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';

import { ElectronService } from 'ngx-electron';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import { Subscription } from 'rxjs/Subscription';

import { MatSidenav } from '@angular/material';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
})
export class CanvasComponent implements OnInit {
  @ViewChild('sidenav') sidenav: MatSidenav;
  @ViewChild('sidenavcontent') sidenavcontent: ElementRef;

  subscription: Subscription;

  mesh: any;
  mesh2d: any;

  modelGeometry: any;
  modelMaterial: any;
  
  model2dGeometry: any;
  modelMaterial2d: any;

  selectMaterial: any;
  selectMaterial2d: any;
  
  wireframeMesh: any;
  wireframe2dMesh: any;

  camera: any;
  camera2d: any;

  renderer: any;
  renderer2d: any;
  
  scene: any;
  scene2d: any;

  controls: any;
  controls2d: any;

  light: any;
  light2d: any;

  views: any;

  showWireframe = true;

  divWidth: any;

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // mesh to load on startup
  meshFileName = 'C:\\Users\\Sandro\\Documents\\libigl\\tutorial\\shared\\cube.off';

  hitfaceIndex = null;

  drawingOption = "camera";

  constructor(private _electronService: ElectronService) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.renderer2d = new THREE.WebGLRenderer({ antialias: true });
    this.renderer2d.setPixelRatio(window.devicePixelRatio);
  }

  selectChanged(event) {
    switch (event.value) {
      case "camera": {
        this.drawingOption = "camera";
        this.unsubscribe();
        this.controls.enabled = true;
        this.controls2d.enabled = true;
        break;
      }
      case "select": {
        this.drawingOption = "select";
        this.subscribe();
        this.controls.enabled = false;
        this.controls2d.enabled = false;
        break;
      }
    }
  }

  ngOnInit() {
    this.init();
    this.animate();
  }

  unsubscribe() {
    this.subscription.unsubscribe();
  }

  subscribe() {
    this.subscription = Observable.fromEvent(this.renderer.domElement, 'mousedown')
      .subscribe(e => {
        var mouseevent = e as MouseEvent;
        this.mouse.x = ((mouseevent.clientX - this.sidenav._width) / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = - (mouseevent.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        var intersects = this.raycaster.intersectObjects(this.scene.children);
        if (intersects.length > 0) {
          this.hitfaceIndex = intersects[0].faceIndex;
          this.mesh.geometry.faces[this.hitfaceIndex].materialIndex = 1;
          this.mesh.geometry.groupsNeedUpdate = true;
        } else {
          this.hitfaceIndex = null;
        }
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

  startSolver() {
    var aa = myAddon.startSolver();
    console.log(aa);
  }

  stopSolver() {
    myAddon.stopSolver();
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

    this.modelMaterial2d = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });

    this.selectMaterial2d = new THREE.MeshPhongMaterial( {
      color: 0xff0000,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });

    var loadedMesh = myAddon.loadMeshWithSoup(this.meshFileName);

    var numVertices = loadedMesh[0][0];
    var numFaces = loadedMesh[0][1];
    var numSoupVertices = loadedMesh[0][2];
    var numSoupFaces = loadedMesh[0][3];

    this.modelGeometry = new THREE.Geometry();
    for (var i = 0; i < numVertices; ++i) {
      var v = loadedMesh[i + 1];
      this.modelGeometry.vertices.push(new THREE.Vector3(v[0], v[1], v[2]));
    }

    for (var i = 0; i < numFaces; ++i) {
      var f = loadedMesh[i + 1 + numVertices];
      this.modelGeometry.faces.push(new THREE.Face3(f[0], f[1], f[2]));
    }

    this.model2dGeometry = new THREE.Geometry();
    this.modelGeometry.dynamic = true;
    for (var i = 0; i < numSoupVertices; ++i) {
      var v = loadedMesh[i + 1 + numVertices + numFaces];
      this.model2dGeometry.vertices.push(new THREE.Vector3(v[0], v[1], v[2]));
    }

    for (var i = 0; i < numSoupFaces; ++i) {
      var f = loadedMesh[i + 1 + numVertices + numFaces + numSoupVertices];
      this.model2dGeometry.faces.push(new THREE.Face3(f[0], f[1], f[2]));
    }

    //this.modelGeometry.computeFaceNormals();
    //this.modelGeometry.computeVertexNormals();
    this.modelGeometry.normalize();

    //this.model2dGeometry.computeFaceNormals();
    //this.model2dGeometry.computeVertexNormals();
    this.model2dGeometry.normalize();

    var geo = new THREE.EdgesGeometry(this.modelGeometry);
    var mat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1});
    this.wireframeMesh = new THREE.LineSegments(geo, mat);

    var geo2d = new THREE.EdgesGeometry(this.model2dGeometry);
    var mat2d = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1});
    this.wireframe2dMesh = new THREE.LineSegments(geo2d, mat2d);

    this.light = new THREE.AmbientLight(0xffffff);
    this.light2d = new THREE.AmbientLight(0xffffff);

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

  @HostListener('window:keypress', ['$event']) keyPressed(event: KeyboardEvent) {
    console.log('key = ', event.key);
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

    this.scene2d = new THREE.Scene();
    this.mesh2d = new THREE.Mesh(this.model2dGeometry, [this.modelMaterial2d, this.selectMaterial2d]);
    if (this.showWireframe) {
      this.mesh2d.add(this.wireframe2dMesh);
    }
    this.scene2d.add(this.mesh2d);
    this.scene2d.add(this.light2d);
    this.scene2d.background = new THREE.Color(0xaeaeae);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (myAddon.solverProgressed()) {
      // var updated2dVertices = myAddon.getUpdatedMesh();
      // var numVerts = updated2dVertices[0][0]; // todo: stays the same, dont repeat here
      // for (var i = 0; i < numVerts; ++i) {
      //   var v = updated2dVertices[i + 1];
      //   this.model2dGeometry.vertices[i] = new THREE.Vector3(v[0], v[1], v[2]);
      // }
      // this.model2dGeometry.verticesNeedUpdate = true;
      var updated2dVertices = myAddon.getUpdatedMesh();
      this.scene2d.remove(this.mesh2d);
      var geo = new THREE.Geometry();
      geo.vertices = this.model2dGeometry.vertices;
      geo.faces = this.model2dGeometry.faces;
      geo.dynamic = true;
      geo.verticesNeedUpdate = true;
      for (var i = 0; i < geo.vertices.length; ++i) {
        var v = updated2dVertices[i+1];
        geo.vertices[i].x = v[0];
        geo.vertices[i].y = v[1];
        geo.vertices[i].z = v[2];
      }
      //geo.normalize();
      var newmesh = new THREE.Mesh(geo, [this.modelMaterial2d, this.selectMaterial2d]);
      this.mesh2d = newmesh;
      this.scene2d.add(this.mesh2d);
    }

    this.renderer.render(this.scene, this.camera);
    this.renderer2d.render(this.scene2d, this.camera2d);
  }
}