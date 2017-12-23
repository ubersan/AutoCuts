import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

  mesh: any;
  camera: any;
  renderer: any;
  scene: any;
  controls: any;

  constructor() {
    this.init();
    this.animate();
  }

  ngOnInit() {
    var result = myAddon.loadBunny();

    var meshInfo = result[0];

    console.log('result', result);
    console.log('meshInfo', meshInfo);
    console.log('Vrows = ', meshInfo[0]);
    console.log('Frows = ', meshInfo[1]);
  }

  init() {
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );

    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.z = 100;

    this.scene = new THREE.Scene();

    var material = new THREE.MeshPhongMaterial( {
      color: 0xff0000,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });

    var bunnyMesh = myAddon.loadBunny();

    var numVertices = bunnyMesh[0][0];
    var numFaces = bunnyMesh[0][1];

    var geometry = new THREE.Geometry();
    for (var i = 0; i < numVertices; ++i) {
      var v = bunnyMesh[i + 1];
      geometry.vertices.push(new THREE.Vector3(v[0]*100, v[1]*100, v[2]*100));
    }

    for (var i = 0; i < numFaces; ++i) {
      var f = bunnyMesh[i + 1 + numVertices];
      geometry.faces.push(new THREE.Face3(f[0], f[1], f[2]));
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    this.mesh = new THREE.Mesh( geometry, material );
    this.scene.add( this.mesh );

    // wireframe
    var geo = new THREE.EdgesGeometry( this.mesh.geometry ); // or WireframeGeometry
    var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
    var wireframe = new THREE.LineSegments( geo, mat );
    this.mesh.add(wireframe);

    var light = new THREE.AmbientLight(0xffffff);
    this.scene.add(light);

    var axesHelper = new THREE.AxesHelper(20);
    this.scene.add(axesHelper);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
  }

  animate() {
    requestAnimationFrame(() => this.animate() );

    //this.mesh.rotation.x += 0.01;
    //this.mesh.rotation.y += 0.01;

    this.renderer.render( this.scene, this.camera );
  }

}
