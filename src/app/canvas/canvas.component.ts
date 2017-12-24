import { Component, OnInit } from '@angular/core';
import { createScope } from '@angular/core/src/profile/wtf_impl';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

  mesh: any;

  modelGeometry: any;
  modelMaterial: any;
  modelMesh: any;
  
  wireframeMesh: any;

  camera: any;
  renderer: any;
  scene: any;
  controls: any;

  light: any;

  showWireframe = true;

  constructor() {
    this.init();
    this.animate();
  }

  ngOnInit() { }

  toggleWireframe() {
    this.createScene();
  }

  init() {
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );

    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.z = 100;

    this.modelMaterial = new THREE.MeshPhongMaterial( {
      color: 0xff0000,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });

    var bunnyMesh = myAddon.loadBunny();

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

  createScene() {
    this.scene = new THREE.Scene();

    this.mesh = new THREE.Mesh(this.modelGeometry, this.modelMaterial);

    if (this.showWireframe) {
      this.mesh.add(this.wireframeMesh);
    }

    this.scene.add(this.mesh);

    this.scene.add(this.light);

    var axesHelper = new THREE.AxesHelper(20);
    this.scene.add(axesHelper);
  }

  animate() {
    requestAnimationFrame(() => this.animate() );

    //this.mesh.rotation.x += 0.01;
    //this.mesh.rotation.y += 0.01;

    this.renderer.render( this.scene, this.camera );
  }

}
