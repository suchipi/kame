#include <nan.h>

NAN_METHOD(Hello) {
  auto message = Nan::New<v8::String>("hello!").ToLocalChecked();
  info.GetReturnValue().Set(message);
}

NAN_MODULE_INIT(Initialize) {
  NAN_EXPORT(target, Hello);
}

NODE_MODULE(addon, Initialize)
