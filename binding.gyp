{
  "targets": [
    {
      "target_name": "addon",
      "sources": [
        "src/addon/addon.cc"
      ],
      "include_dirs": [
          "<!(node -e \"require('nan')\")"
       ]
    }
  ]
}