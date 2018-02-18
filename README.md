# AutoCuts

## Build

1. Clone/Download repo
2. Install node: https://nodejs.org/en/. Enter command line and write 'node'. Executing 'process.versions' should give you a list of libraries and their used versions.
-  Run 'npm install -g node-gyp'. Needed to build c++-code.
-  Make sure Python is installed (Tested with Python 2.7.13 https://www.python.org/downloads/release/python-2713/).
3. Move into the local repo and run the 'install.ps1' powershell script. This downloads and installs all needed dependencies.
- cd into /src/addon
- Run 'node-gyp install 8.2.1'.
- Run 'node-gyp configure'. This should result in a 'build' folder containing a VS solution 'binding.sln'; open it.
- switch to release configuration
- add openmp option
- add Preprocessor 'NOMINMAX'
- change node header directory (additinal include directories) to correct version 8.2.1 (resides in /User/you/.node-gyp per default on windows)
- build
4. Run 'npm run electron-build' to build and run the app in production mode.
5. Run 'npm run electron' to just run the built app without rebuilding it.