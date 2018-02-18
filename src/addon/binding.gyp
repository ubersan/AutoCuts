{
  "targets": [
    {
      "target_name": "addon",
      "sources": [
        "addon.cpp",
        "src/BBox.cpp",
        "src/Energy.cpp",
        "src/EnergySymDir.cpp",
        "src/Newton.cpp",
        "src/Position.cpp",
        "src/Separation.cpp",
        "src/Solver.cpp",
        "src/SolverWrapper.cpp",
        "src/Utils.cpp",
      ],
      "include_dirs": [
          "<!(node -e \"require('nan')\")",
          "/../../libigl/include",
          "/../../Eigen-3.3.4",
          "./hdr",
       ],
      'cflags_cc!': ['/openmp'],
      'ccflags!': ['/openmp']
    }
  ]
}