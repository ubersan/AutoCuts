Write-Output "Installing npm dependencies ..."
npm install

Write-Output "Cloning libigl"
git clone --recursive https://github.com/libigl/libigl.git

Write-Output "Cloning Eigen tag 3.3.4"
git clone https://github.com/eigenteam/eigen-git-mirror.git Eigen-3.3.4
Set-Location Eigen-3.3.4
git checkout 3.3.4
Set-Location ..