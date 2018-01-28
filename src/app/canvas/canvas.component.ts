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
  @ViewChild('plot3d') plot3d: ElementRef;
  @ViewChild('plot2d') plot2d: ElementRef;

  subscription: any;
  midbarSubscription: any;

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

  // start with empty mesh
  meshFileName = null;

  hitfaceIndex = null;

  drawingOption = "camera";

  lambda = 0.0;
  delta = 1.0;

  resizeActive = false;

  renderHeight = 0;

  pixelsToTheLeft = 0;

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
        this.mouse.x = (((mouseevent.clientX - (this.sidenav._width + 20)) - this.pixelsToTheLeft) / this.renderer.domElement.clientWidth) * 2 - 1;
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
    this.renderHeight = window.innerHeight - this.verticalMinus;

    this.renderer.setSize((window.innerWidth - (this.sidenav._width + 20)) / 2 - this.pixelsToTheLeft, window.innerHeight - this.verticalMinus);
    this.renderer2d.setSize((window.innerWidth - (this.sidenav._width + 20)) / 2 + this.pixelsToTheLeft, window.innerHeight - this.verticalMinus);

    this.plot3d.nativeElement.appendChild(this.renderer.domElement);
    this.plot2d.nativeElement.appendChild(this.renderer2d.domElement);

    console.log('height: ', window.innerHeight - this.verticalMinus);
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
    this.camera = new THREE.PerspectiveCamera(40, (((window.innerWidth - (this.sidenav._width + 20)) / 2) - this.pixelsToTheLeft) / (window.innerHeight - this.verticalMinus), 0.1, 1000);
    this.camera.position.z = 2;

    this.camera2d = new THREE.PerspectiveCamera(40, (((window.innerWidth - (this.sidenav._width + 20)) / 2) + this.pixelsToTheLeft) / (window.innerHeight - this.verticalMinus), 0.1, 1000);
    this.camera2d.position.z = 3;

    if (this.meshFileName) {
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

      var geometry = new THREE.BufferGeometry();
      var positions = [];
      for ( var i = 0; i < numFaces; i ++ ) {
        // positions
        var f = loadedMesh[i + 1 + numVertices];
        var v0 = loadedMesh[f[0] + 1];
        var v1 = loadedMesh[f[1] + 1];
        var v2 = loadedMesh[f[2] + 1];
        positions.push( v0[0], v0[1], v0[2] );
        positions.push( v1[0], v1[1], v1[2] );
        positions.push( v2[0], v2[1], v2[2] );
      }
      var positionAttribute = new THREE.Float32BufferAttribute( positions, 3 );
      geometry.addAttribute( 'position', positionAttribute );
      geometry.computeBoundingSphere();
      
      this.modelGeometry = geometry;

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

      //this.modelGeometry.normalize();
      this.model2dGeometry.normalize();

      //var geo = new THREE.EdgesGeometry(this.modelGeometry);
      //var mat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1});
      //this.wireframeMesh = new THREE.LineSegments(geo, mat);

      var geo2d = new THREE.EdgesGeometry(this.model2dGeometry);
      var mat2d = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1});
      this.wireframe2dMesh = new THREE.LineSegments(geo2d, mat2d);
    }

    this.light = new THREE.AmbientLight(0xffffff);
    this.light2d = new THREE.AmbientLight(0xffffff);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableKeys = false;

    this.controls2d = new THREE.OrbitControls(this.camera2d, this.renderer2d.domElement);
    this.controls2d.enableKeys = false;
    this.controls2d.enableRotate = false;

    this.createScene();
  }

  @HostListener('window:resize') onResize() {
    this.camera.aspect = (((window.innerWidth - (this.sidenav._width + 20)) / 2) - this.pixelsToTheLeft) / (window.innerHeight - this.verticalMinus);
    this.camera.updateProjectionMatrix();

    this.camera2d.aspect = (((window.innerWidth - (this.sidenav._width + 20)) / 2) + this.pixelsToTheLeft) / (window.innerHeight - this.verticalMinus);
    this.camera2d.updateProjectionMatrix();

    this.renderer.setSize((window.innerWidth - (this.sidenav._width + 20)) / 2 - this.pixelsToTheLeft, window.innerHeight - this.verticalMinus);
    this.renderer2d.setSize((window.innerWidth - (this.sidenav._width + 20)) / 2 + this.pixelsToTheLeft, window.innerHeight - this.verticalMinus);

    this.renderHeight = window.innerHeight - this.verticalMinus;
  }

  // TODO: only listens when canvas is clicked.
  @HostListener('window:keypress', ['$event']) keyPressed(event: KeyboardEvent) {
    console.log('key = ', event.key);
    switch (event.key) {
      case 'w': {
        this.lambda = myAddon.increaseLambda();
        break;
      }
      case 's': {
        this.lambda = myAddon.decreaseLambda();
        break;
      }
      case 'a': {
        this.delta = myAddon.decreaseDelta();
        break;
      }
      case 'd': {
        this.delta = myAddon.increaseDelta();
      }
    }
  }

  createScene() {
    this.scene = new THREE.Scene();

    if (this.meshFileName) {
      /*this.mesh = new THREE.Mesh(this.modelGeometry, [this.modelMaterial, this.selectMaterial]);
      if (this.showWireframe) {
       // this.mesh.add(this.wireframeMesh);
      }*/
      //var material = new THREE.MeshPhongMaterial();
      var darkMaterial = new THREE.MeshBasicMaterial();
      var wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        transparent: true,
        polygonOffset: true,
        polygonOffsetFactor: -10.0,
        polygonOffsetUnits: -40.0
      }); 
      var multiMaterial = [ darkMaterial, wireframeMaterial ]; 
      //this.mesh = new THREE.Mesh( this.modelGeometry, darkMaterial );
      this.mesh = THREE.SceneUtils.createMultiMaterialObject(this.modelGeometry, multiMaterial);
      this.scene.add(this.mesh);
    }

    this.scene.add(this.light);
    this.scene.background = new THREE.Color(0xaeaeae);

    this.scene2d = new THREE.Scene();

    if (this.meshFileName) {
      this.mesh2d = new THREE.Mesh(this.model2dGeometry, [this.modelMaterial2d, this.selectMaterial2d]);
      if (this.showWireframe) {
        this.mesh2d.add(this.wireframe2dMesh);
      }
      this.scene2d.add(this.mesh2d);
    }

    this.scene2d.add(this.light2d);
    this.scene2d.background = new THREE.Color(0xaeaeae);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // TODO: Solver should always be queriable (not only after a mesh has been loaded)
    if (this.meshFileName && myAddon.solverProgressed()) {
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
      var newmesh = new THREE.Mesh(geo, [this.modelMaterial2d, this.selectMaterial2d]);

      var geo2d = new THREE.EdgesGeometry(geo);
      var mat2d = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1});
      this.wireframe2dMesh = new THREE.LineSegments(geo2d, mat2d);
      if (this.showWireframe) {
        newmesh.add(this.wireframe2dMesh);
      }

      this.mesh2d = newmesh;
      this.scene2d.add(this.mesh2d);
    }

    this.renderer.render(this.scene, this.camera);
    this.renderer2d.render(this.scene2d, this.camera2d);
  }

  movebarActive = false;
  lastPos: MouseEvent;

  mouseDownBar(event: MouseEvent) {
    this.movebarActive = true;
    this.lastPos = event;

    this.midbarSubscription = Observable.fromEvent(document, 'mousemove')
      .subscribe(e => {
        var mouseevent = e as MouseEvent;
        var diffx = this.lastPos.clientX - mouseevent.clientX;
        this.pixelsToTheLeft = this.pixelsToTheLeft + diffx;
        this.onResize();
        this.lastPos = mouseevent;
      });
  }

  mouseUpBar() {
    this.movebarActive = false;
    this.midbarSubscription.unsubscribe();
  }
}