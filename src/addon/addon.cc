#include <cmath>
#include <nan.h>

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

void Init(v8::Local<v8::Object> exports) {  
    NAN_EXPORT(exports, factorial);
}

NODE_MODULE(example1, Init)