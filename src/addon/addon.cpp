#include <cmath>
#include <nan.h>

#include "Utils.h"
#include "SolverWrapper.h"

#include <igl/readOFF.h>

// call node-gyp rebuild --target=1.7.10 --arch=x64 --dist-url=https://atom.io/download/atom-shell
// when changing the addon.cpp

// OR: rebuild the VS solution (preferred)

// when needing to generate new vs solution do
// node-gyp configure
// add openmp option
// add Preprocessor NOMINMAX
// change node header directory to correct version in .node-gyp/x.x.x/node
// install new version with node-gyp install x.x.x
// (resides in C:/User/you/.node-gyp per default on windows)
// build Release

enum class Param { LAMBDA, DELTA, BOUND, POSITION_WEIGHT };

SolverWrapper* solver_wrapper;

thread solver_thread;

NAN_METHOD(loadMeshWithSoup) {
  Eigen::MatrixXd V;
  Eigen::MatrixXi F_read;

  if (!info[0]->IsString()) {
    Nan::ThrowTypeError("Argument should be a string");
    return;
  }

  v8::String::Utf8Value param1(info[0]->ToString());
  std::string filenamePath = std::string(*param1);
  igl::readOFF(filenamePath, V, F_read);

  // if faces are received as quads, transform them into triangles first
  MatX3i F;
  if (F_read.cols() == 4) {
    F = MatX3i(F_read.rows() * 2, 3);
    Vec4i face;
    for (int i = 0; i < F_read.rows(); ++i) {
      face = F_read.row(i);
      F.row(2 * i) << face[0], face[1], face[3];
      F.row(2 * i + 1) << face[1], face[2], face[3];
    }
  }
  else {
    F = F_read;
  }

  // normalize [0, 1] vertex coordinates and centralize them [-0.5, 0.5]
  double xDist = V.col(0).maxCoeff() - V.col(0).minCoeff();
  double yDist = V.col(1).maxCoeff() - V.col(1).minCoeff();
  double zDist = V.col(2).maxCoeff() - V.col(2).minCoeff();

  double maxDist = max(max(xDist, yDist), zDist);

  V.col(0).array() /= maxDist;
  V.col(1).array() /= maxDist;
  V.col(2).array() /= maxDist;

  V.col(0).array() -= V.col(0).mean();
  V.col(1).array() -= V.col(1).mean();
  V.col(2).array() -= V.col(2).mean();

  solver_wrapper = new SolverWrapper();
  solver_wrapper->init(V, F, V, F, Utils::Init::RANDOM);
  MatX2 Vs = solver_wrapper->solver->Vs;
  MatX3i Fs = solver_wrapper->solver->Fs;

  auto result_list = Nan::New<v8::Array>();

  auto obj = Nan::New<v8::Object>();
  obj->Set(0, Nan::New<v8::Number>(V.rows()));
  obj->Set(1, Nan::New<v8::Number>(F.rows()));
  obj->Set(2, Nan::New<v8::Number>(Vs.rows()));
  obj->Set(3, Nan::New<v8::Number>(Fs.rows()));
  result_list->Set(0, obj);

  for (auto i = 0; i < V.rows(); ++i) {
    auto o = Nan::New<v8::Object>();
    o->Set(0, Nan::New<v8::Number>(V(i, 0)));
    o->Set(1, Nan::New<v8::Number>(V(i, 1)));
    o->Set(2, Nan::New<v8::Number>(V(i, 2)));
    result_list->Set(i + 1, o);
  }

  for (auto i = 0; i < F.rows(); ++i) {
    auto o = Nan::New<v8::Object>();
    o->Set(0, Nan::New<v8::Number>(F(i, 0)));
    o->Set(1, Nan::New<v8::Number>(F(i, 1)));
    o->Set(2, Nan::New<v8::Number>(F(i, 2)));
    result_list->Set(i + 1 + V.rows(), o);
  }

  for (auto i = 0; i < Vs.rows(); ++i) {
    auto o = Nan::New<v8::Object>();
    o->Set(0, Nan::New<v8::Number>(Vs(i, 0)));
    o->Set(1, Nan::New<v8::Number>(Vs(i, 1)));
    o->Set(2, Nan::New<v8::Number>(0));
    result_list->Set(i + 1 + V.rows() + F.rows(), o);
  }

  for (auto i = 0; i < Fs.rows(); ++i) {
    auto o = Nan::New<v8::Object>();
    o->Set(0, Nan::New<v8::Number>(Fs(i, 0)));
    o->Set(1, Nan::New<v8::Number>(Fs(i, 1)));
    o->Set(2, Nan::New<v8::Number>(Fs(i, 2)));
    result_list->Set(i + 1 + V.rows() + F.rows() + Vs.rows(), o);
  }

  info.GetReturnValue().Set(result_list);
}

NAN_METHOD(startSolver) {
  solver_thread = thread(&Solver::run, solver_wrapper->solver.get());
  solver_thread.detach();
}

NAN_METHOD(solverProgressed) {
  auto has_progressed = solver_wrapper->progressed();
  auto progressed = Nan::New<v8::Boolean>(has_progressed);

  info.GetReturnValue().Set(progressed);
}

NAN_METHOD(getUpdatedMesh) {
  MatX2 Xnew;
  solver_wrapper->solver->get_mesh(Xnew);

  auto result_list = Nan::New<v8::Array>();

  auto obj = Nan::New<v8::Object>();
  obj->Set(0, Nan::New<v8::Number>(Xnew.rows()));
  result_list->Set(0, obj);

  for (auto i = 0; i < Xnew.rows(); ++i) {
    auto o = Nan::New<v8::Object>();
    o->Set(0, Nan::New<v8::Number>(Xnew(i, 0)));
    o->Set(1, Nan::New<v8::Number>(Xnew(i, 1)));
    o->Set(2, Nan::New<v8::Number>(0));
    result_list->Set(i + 1, o);
  }

  info.GetReturnValue().Set(result_list);
}

static void update_energy_param(Param p, double value) {
  switch (p)
  {
  case Param::LAMBDA:
    solver_wrapper->set_lambda(value);
    break;
  case Param::DELTA:
    solver_wrapper->set_delta(value);
    break;
  case Param::BOUND:
    solver_wrapper->set_bound(value);
    break;
  case Param::POSITION_WEIGHT:
    solver_wrapper->set_position_weight(value);
    break;
  default:
    assert(false && "Unknown energy parameter");
  }
}

NAN_METHOD(increaseLambda) {
  if (solver_wrapper->solver->energy->lambda <= 0.98)
  {
    if (solver_wrapper->solver->energy->lambda >= 0.85)
      update_energy_param(Param::LAMBDA, solver_wrapper->solver->energy->lambda + 0.01);
    else if (solver_wrapper->solver->energy->lambda <= 0.9)
      update_energy_param(Param::LAMBDA, solver_wrapper->solver->energy->lambda + 0.1);
  }

  info.GetReturnValue().Set(Nan::New<v8::Number>(solver_wrapper->solver->energy->lambda));
}

NAN_METHOD(decreaseLambda) {
  if (solver_wrapper->solver->energy->lambda > 0.9)
    update_energy_param(Param::LAMBDA, solver_wrapper->solver->energy->lambda - 0.01);
  else if (solver_wrapper->solver->energy->lambda >= 0.1)
    update_energy_param(Param::LAMBDA, solver_wrapper->solver->energy->lambda - 0.1);

  info.GetReturnValue().Set(Nan::New<v8::Number>(solver_wrapper->solver->energy->lambda));
}

NAN_METHOD(increaseDelta) {
  update_energy_param(Param::DELTA, solver_wrapper->solver->energy->separation->delta * 2.0);

  info.GetReturnValue().Set(Nan::New<v8::Number>(solver_wrapper->solver->energy->separation->delta));
}

NAN_METHOD(decreaseDelta) {
  update_energy_param(Param::DELTA, solver_wrapper->solver->energy->separation->delta * 0.5);

  info.GetReturnValue().Set(Nan::New<v8::Number>(solver_wrapper->solver->energy->separation->delta));
}

void Init(v8::Local<v8::Object> exports) {
    NAN_EXPORT(exports, loadMeshWithSoup);
    NAN_EXPORT(exports, startSolver);
    NAN_EXPORT(exports, solverProgressed);
    NAN_EXPORT(exports, getUpdatedMesh);
    NAN_EXPORT(exports, increaseLambda);
    NAN_EXPORT(exports, decreaseLambda);
    NAN_EXPORT(exports, increaseDelta);
    NAN_EXPORT(exports, decreaseDelta);
}

NODE_MODULE(addon, Init)
