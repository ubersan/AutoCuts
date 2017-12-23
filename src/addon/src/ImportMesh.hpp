#include <string>
#include <igl/readOFF.h>

class ImportMesh {
public:
    void readFile(std::string filename, int& vRows, int& vCols, int& fRows, int& fCols);
    void readMatrices(std::string filename, Eigen::MatrixXd& V, Eigen::MatrixXi& F);
private:
};