{
  "targets": [
    {
      "target_name": "addon",
      "sources": [
        "addon.cpp",
        "src/ImportMesh.cpp"
      ],
      "include_dirs": [
          "<!(node -e \"require('nan')\")",
          "../../../../libigl-master/include",
          "../../../../eigen"
       ]
    }
  ]
}