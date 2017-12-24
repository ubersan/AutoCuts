#include <cmath>
#include <nan.h>

#include "src/ImportMesh.hpp"

// call node-gyp rebuild --target=1.7.10 --arch=x64 --dist-url=https://atom.io/download/atom-shell
// when changing the addon.cc

static int factorial_impl(int n) {
    int ret = 1; for (int i = 1; i <= n; ++i) { ret *= i; } return ret;
}

NAN_METHOD(factorial) {

    if (info.Length() != 1) {
        Nan::ThrowTypeError("Wrong number of arguments");
        return;
    }

    if (!info[0]->IsNumber()) {
        Nan::ThrowTypeError("Argument should be a number");
        return;
    }

    double arg0 = info[0]->NumberValue();
    v8::Local<v8::Number> num = Nan::New(factorial_impl(static_cast<int>(arg0)));

    info.GetReturnValue().Set(num);
}

NAN_METHOD(loadBunny) {
    ImportMesh* importer = new ImportMesh();

    Eigen::MatrixXd V;
    Eigen::MatrixXi F;

    if (!info[0]->IsString()) {
        Nan::ThrowTypeError("Argument should be a string");
        return;
    }

    v8::String::Utf8Value param1(info[0]->ToString());
    std::string filenamePath = std::string(*param1); 
    importer->readMatrices(filenamePath, V, F);

    // v8::Local<v8::Number> num = Nan::New<v8::Number>(V.rows());
    // info.GetReturnValue().Set(num);

    auto result_list = Nan::New<v8::Array>();

    auto obj = Nan::New<v8::Object>();
    obj->Set(0, Nan::New<v8::Number>(V.rows()));
    obj->Set(1, Nan::New<v8::Number>(F.rows()));
    obj->Set(2, Nan::New<v8::Number>(0));
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

    info.GetReturnValue().Set(result_list);

    delete(importer);
    importer = nullptr;
}

void Init(v8::Local<v8::Object> exports) {  
    NAN_EXPORT(exports, factorial);
    NAN_EXPORT(exports, loadBunny);
}

NODE_MODULE(addon, Init)