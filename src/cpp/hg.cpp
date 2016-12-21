#include <node.h>
#include <utility>
#include <iostream>
#include "hg.h"

namespace hg {

  using namespace v8;

  v8::Persistent<v8::FunctionTemplate> hgRepoTemplate;
  void hgStatus(const FunctionCallbackInfo<Value>& args)
  {
    Isolate* isolate = args.GetIsolate();
    HandleScope scope(isolate);
    Local<Object> self = args.This();
    Local<External> wrapper = Local<External>::Cast(self->GetInternalField(0));
    void* valuePtr = wrapper->Value();
    auto ptr = static_cast<hgRepo*>(valuePtr);
    args.GetReturnValue().Set(String::NewFromUtf8(isolate, ptr->status("").c_str()));
  }
  
  void hgRepoConstructor(const FunctionCallbackInfo<Value>& args)
  {
    Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);

    if (!args.IsConstructCall())
      std::cout << " DUN FUCKED UP SON " << std::endl;
    // TODO get string from args
    auto repo = new (std::nothrow) hgRepo("foo");
    auto obj = v8::Local<Object>::New(isolate, args.This());
    obj->SetInternalField(0, External::New(isolate, repo));
    args.GetReturnValue().Set(args.This());
  }

  /*
v8::Local<v8::FunctionTemplate> t = v8::FunctionTemplate::New();
t->Set("func_property", v8::Number::New(1));
v8::Local<v8::Template> proto_t = t->PrototypeTemplate();
proto_t->Set("proto_method", v8::FunctionTemplate::New(InvokeCallback));
proto_t->Set("proto_const", v8::Number::New(2));
v8::Local<v8::ObjectTemplate> instance_t = t->InstanceTemplate();
instance_t->SetAccessor("instance_accessor", InstanceAccessorCallback);
instance_t->SetNamedPropertyHandler(PropertyHandlerCallback, ...);
instance_t->Set("instance_property", Number::New(3));
v8::Local<v8::Function> function = t->GetFunction();
v8::Local<v8::Object> instance = function->NewInstance();
   */
  
  void Method(const FunctionCallbackInfo<Value>& args) {
    auto isolate = args.GetIsolate();
    args.GetReturnValue().Set(String::NewFromUtf8(isolate, "world"));
  }

  void init(Local<Object> exports) {
    NODE_SET_METHOD(exports, "hello", Method);

    Isolate* isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);
    v8::Local<v8::FunctionTemplate> localHgRepoTemplate = v8::FunctionTemplate::New(isolate, hgRepoConstructor);
    v8::Local<v8::ObjectTemplate> inst = localHgRepoTemplate->InstanceTemplate();
    inst->SetInternalFieldCount(1);
    
    //    NODE_SET_PROTOTYPE_METHOD(localHgRepoTemplate, "status", hgStatus); 

    hgRepoTemplate.Reset(isolate, localHgRepoTemplate);
  }

  NODE_MODULE(hg, init)

  hgRepo::hgRepo(std::string fullPath)
  {
    this->fullPath = fullPath; // TODO why dont I have c++11...
  }

  std::string hgRepo::status(const std::string& flags) const
  {
    return "no changes.";
  }




  
}  // namespace hg
